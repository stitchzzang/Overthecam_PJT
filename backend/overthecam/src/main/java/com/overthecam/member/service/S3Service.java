package com.overthecam.member.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.overthecam.common.exception.GlobalException;
import com.overthecam.member.exception.S3ErrocCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RequiredArgsConstructor
@Service
public class S3Service {

    private final AmazonS3 s3Client;

    public String uploadFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new GlobalException(S3ErrocCode.FILE_EMPTY, "받은 파일이 없습니다.");
        }

        try {

            String bucketName = "overthecam";
            String fileObjKeyName = "thumbnails/" + UUID.randomUUID() + "_" + file.getOriginalFilename();

            // 메타데이터 설정
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentType(file.getContentType());     // 실제 파일의 컨텐츠 타입 사용
            metadata.setContentLength(file.getSize());          // 파일 크기 설정
            metadata.addUserMetadata("originalFileName", file.getOriginalFilename());  // 원본 파일명 저장

            s3Client.putObject(bucketName, fileObjKeyName, file.getInputStream(), metadata);

            return s3Client.getUrl(bucketName, fileObjKeyName).toString();
        } catch (Exception e) {
            throw new GlobalException(S3ErrocCode.S3_UPLOAD_ERROR, "파일 업로드 중 오류가 발생했습니다. 에러: " + e.getMessage());
        }

    }
}
