import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  CreatePostComponent,
  EditPostComponent,
  PostsListComponent,
  PostsSectionComponent,
  UserDetailsComponent,
} from './components';
import { MainContentComponent } from './pages';
import { FeedRoutingModule } from './feed-routing.module';
import { TransformUsername } from 'src/app/pipes/username.pipe';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [
    CreatePostComponent,
    EditPostComponent,
    PostsListComponent,
    PostsSectionComponent,
    UserDetailsComponent,
    MainContentComponent,
    TransformUsername,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FeedRoutingModule,
    MatDialogModule,
    MatMenuModule,
  ],
})
export class FeedModule {}
