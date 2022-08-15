import { PostsAccess } from '../dataLayer/postsAccess'
import { AttachmentUtils } from '../fileStorage/attachmentUtils'
import { PostItem } from '../models/PostItem'
import { CreatePostRequest } from '../requests/CreatePostRequest'
import { UpdatePostRequest } from '../requests/UpdatePostRequest'
import { PostUpdate } from '../models/PostUpdate'

import * as uuid from 'uuid'

const postsAccess = new PostsAccess();
const accessFile = new AttachmentUtils();

export async function createAttachmentPresignedUrl(userId: string, postId: string): Promise<String> {
    const uploadUrl = await accessFile.getUploadUrl(postId);
    const attachmentUrl = accessFile.getAttachmentUrl(postId);
    await postsAccess.updateAttachmentUrl(userId, postId, attachmentUrl);
    return uploadUrl;
}

export async function getAllPosts(userId: string): Promise<PostItem[]> {
    return postsAccess.getAllPosts(userId);
}

export async function searchPost(userId: string, keyword: string): Promise<PostItem[]> {
    return postsAccess.searchPosts(userId, keyword);
}

export async function createPost(createPostRequest: CreatePostRequest, userId: string): Promise<PostItem> {

    const postId = uuid.v4();
    const timestamp = new Date().toISOString();

    return await postsAccess.createPost({
        userId: userId,
        postId: postId,
        createdAt: timestamp,
        title: createPostRequest.title,
        dueDate: createPostRequest.dueDate,   
        body: createPostRequest.body
    });
}

export async function updatePost(postId: string, updatePostRequest: UpdatePostRequest, userId: string): Promise<PostUpdate> {

    return await postsAccess.updatePost({
        title: updatePostRequest.title,
        dueDate: updatePostRequest.dueDate,
        body: updatePostRequest.body
    },
        postId,
        userId);
}

export async function deletePost(postId: string, userId: string) {
    await postsAccess.deletePost(postId, userId)
}