# TODO - Video upload deployed-only failure

- [ ] Update `app/api/admin/product/upload/route.js`:
  - [ ] Set `resource_type` explicitly to `video` when file is a video.
  - [ ] Replace `cloudinary.uploader.upload_stream` + `streamifier` with `cloudinary.uploader.upload(buffer, ...)`.
  - [ ] Improve request/file validation.
  - [ ] Improve error responses (include uploadId, file metadata, chosen resource_type, and Cloudinary error details).
- [ ] Test locally (image-only, video-only, image+video).
- [ ] Verify on deployed Vercel (video upload should work; if it fails, UI should show real error message from API response).

