import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Observable, filter, of } from 'rxjs';
import { Socket } from 'ngx-socket-io';
import { CallService } from 'src/app/core/services/call.service';

@Component({
  selector: 'chat-component',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit {
  // message Params
  rooms: any[] = [];
  userList: any[] = [];
  dataCalled: any = {
    caller: '',
    called: '',
    room: '',
  };
  messages: any[] = [];
  currentRoom: string = 'General';
  messageText: string = '';
  currentUser: any = localStorage.getItem('username') || 'No identified';
  userRemote: any = {};
  openUserList: boolean = false;
  calling: boolean = false;
  inCall: boolean = false;
  noCall: boolean = true;
  iIamCalling: boolean= false;
  activeTab: string = 'rooms';
  // video call Params
  public isCallStarted$: Observable<boolean>;
  private peerId: string;
  peerRemoteId: string;
  @ViewChild('localVideo') localVideo: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo: ElementRef<HTMLVideoElement>;
  
  constructor(private socket: Socket, private callService: CallService) {
    this.isCallStarted$ = this.callService.isCallStarted$;
    this.peerId = this.callService.initPeer();
  }

  ngOnInit() {
    this.callService.localStream$
      .pipe(filter((res) => !!res))
      .subscribe(
        (stream) => (this.localVideo.nativeElement.srcObject = stream)
      );
    this.callService.remoteStream$
      .pipe(filter((res) => !!res))
      .subscribe(
        (stream) => (this.remoteVideo.nativeElement.srcObject = stream)
      );
    this.joinRoomByName('General');
    //this.callUser();
    this.socket.on('receiveMessage', (message: any) => {
      if (message.room == this.currentRoom) {
        this.messages.push(message);
        //console.log('receiveMessage: ', message);
      }
    });
    this.socket.emit('getRooms');

    this.socket.on('roomList', (rooms: string[]) => {
      this.rooms = rooms.filter((room) => !room.startsWith('S'));
    });

    this.socket.on('historyMessages', (history: any[]) => {
      this.messages = history;
      //console.log('History: ', history);
    });

    this.socket.on('incomingCall', (data: any) => {
      console.log('Incoming call from', data);
      if(data.called == this.currentUser){
        //this.showModal(false);
        //this.answerCall();
        this.dataCalled = data;
        this.inCall = true;
      }
    });

    this.socket.on('callAnswered', (data: any) => {
      console.log('Call has been answered', data);
      this.inCall = false;
      this.noCall = false;
      this.userRemote.username = "User";
      this.showModal(true);
    });

    this.socket.on('callCancelled', (data: any) => {
      console.log('Call has been cancelled', data);
      this.noCall = true;
      this.calling =false;
      this.callService.closeMediaCall();
      this.callService.destroyPeer();
      this.closeMediaStreams();
    });

    this.listenForUserList();
    this.getUsers();
  }

  joinRoom() {
    this.socket.emit('joinRoom', {
      room: this.currentRoom,
      username: this.currentUser,
      image: 'https://www.w3schools.com/howto/img_avatar.png',
      peerID: this.peerId,
    });
  }

  joinRoomByName(name: string) {
    this.socket.emit('joinRoom', {
      room: name,
      username: this.currentUser,
      image: 'https://www.w3schools.com/howto/img_avatar.png',
      peerID: this.peerId,
    });
  }

  swapRoom(room: string) {
    console.log('swapRoom', room);
    //this.leaveRoom();
    this.currentRoom = room;
    this.joinRoom();
  }

  leaveRoom() {
    this.socket.emit('leaveRoom', this.currentRoom);
    this.messages = [];
  }

  sendMessage(): void {
    const messageData = {
      room: this.currentRoom,
      message: this.messageText,
      user: this.currentUser,
      date: new Date(), // Include the current date
    };
    this.socket.emit('sendMessage', messageData);
    this.messageText = '';
  }

  listenForUserList() {
    this.socket.on('userList', (userList: string[]) => {
      this.userList = userList.filter((item) => item !== this.currentUser);
      console.log('Received user list:', this.userList);
      // Update your component's logic or UI based on the user list
    });

    this.socket.on('connect', () => {
      //console.log('Connected to server');
      this.getUsers();
    });

    this.socket.on('disconnect', () => {
      //console.log('Disconnected from server');
      this.userList = []; // Reset the user list when disconnected
    });
  }

  getUsers() {
    this.socket.emit('getUsers');
  }

  modelChanged(newObj: any) {
    //console.log('model changed', newObj);
  }

  connectUser(user: any) {
    //console.log('connect to: ', user.username);
    this.userRemote = user;
    this.peerRemoteId = user.peerID;
    const result = user.username.localeCompare(this.currentUser);

    if (result < 0) {
      this.swapRoom(`S-${user.username}-${this.currentUser}`);
      //console.log(`S-${user.username}-${this.currentUser}`);
    } else {
      this.swapRoom(`S-${this.currentUser}-${user.username}`);
      console.log(`S-${this.currentUser}-${user.username}`);
    }
  }

  openUserListB(session: string) {
    this.activeTab = session;
    this.openUserList = !this.openUserList;
  }

  public showModal(joinCall: boolean): void {
    if (joinCall) {
      of(this.callService.establishMediaCall(this.peerRemoteId));
    } else {
      of(this.callService.enableCallAnswer());
    }
  }

  public endCall() {
    this.callService.closeMediaCall();
  }

  ngOnDestroy(): void {
    this.callService.destroyPeer();
  }

  callUser() {
    console.log('callUser');
    this.inCall = true;
    this.iIamCalling = true;
    this.calling =true;
    this.showModal(true);
    const data = { caller: this.currentUser, called: this.userRemote.username, peerID: this.peerId };
    this.socket.emit('startCall', data);
  }

  answerCall() {
    this.inCall = false;
    this.noCall = false;
    this.calling = true;
    const data = { caller: this.currentUser, called: this.userRemote.username, peerID: this.peerId };
    this.socket.emit('answerCall', data);
    this.showModal(false);
  }

  cancelCall() {
    this.noCall = true;
    this.calling =false;
    this.inCall = false;
    this.callService.closeMediaCall();
    this.callService.destroyPeer();
    this.closeMediaStreams();
    const data = { caller: this.currentUser, called: this.userRemote.username, peerID: this.peerId };
    this.socket.emit('cancelCall', data);
  }


  closeMediaStreams(): void {
    const localVideoElement: HTMLVideoElement = this.localVideo.nativeElement;
    const remoteVideoElement: HTMLVideoElement = this.remoteVideo.nativeElement;
  
    // Stop the media streams
    const localStream: MediaStream = localVideoElement.srcObject as MediaStream;
    const remoteStream: MediaStream = remoteVideoElement.srcObject as MediaStream;
  
    if (localStream) {
      const tracks = localStream.getTracks();
      tracks.forEach((track) => track.stop());
    }
  
    if (remoteStream) {
      const tracks = remoteStream.getTracks();
      tracks.forEach((track) => track.stop());
    }
  
    // Clear the srcObject to stop displaying the video
    localVideoElement.srcObject = null;
    remoteVideoElement.srcObject = null;
  }
}
