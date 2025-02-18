package com.overthecam.member.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.overthecam.auth.domain.User;
import com.overthecam.auth.repository.UserRepository;
import com.overthecam.common.dto.CommonResponseDto;
import com.overthecam.common.exception.GlobalException;
import com.overthecam.member.exception.S3ErrocCode;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RequiredArgsConstructor
@Service
@Slf4j
public class S3Service {

    private static final String S3_PREFIX = "https://s3.ap-northeast-2.amazonaws.com/overthecam/thumbnails/";
    private static final String CLOUDFRONT_DOMAIN = "https://d26tym50939cjl.cloudfront.net/";
    private final AmazonS3 s3Client;
    private final UserRepository userRepository;

    @Transactional  // 트랜잭션 추가
    public CommonResponseDto uploadFile(MultipartFile file, Long userId) {
        if (file.isEmpty()) {
            throw new GlobalException(S3ErrocCode.FILE_EMPTY, "받은 파일이 없습니다.");
        }

        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            String bucketName = "overthecam";
            String fileObjKeyName = "thumbnails/" + UUID.randomUUID() + "_" + file.getOriginalFilename();

            // 메타데이터 설정
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentType(file.getContentType());     // 실제 파일의 컨텐츠 타입 사용
            metadata.setContentLength(file.getSize());          // 파일 크기 설정
            metadata.addUserMetadata("originalFileName", file.getOriginalFilename());  // 원본 파일명 저장

            s3Client.putObject(bucketName, fileObjKeyName, file.getInputStream(), metadata);

            String fileUrl = s3Client.getUrl(bucketName, fileObjKeyName).toString();

            String fileName = fileUrl.substring(S3_PREFIX.length());
            String imageUrl = CLOUDFRONT_DOMAIN + fileName;

            user.updateProfileImage(imageUrl);
            User savedUser = userRepository.save(user);

            log.info("Saved user profile image: {}", savedUser.getProfileImage());

            // 트랜잭션이 끝나기 전에 DB에서 다시 조회해서 확인
            User checkedUser = userRepository.findById(userId).orElseThrow();
            log.info("After transaction - User profile image: {}", checkedUser.getProfileImage());

            return CommonResponseDto.ok();
        } catch (Exception e) {
            throw new GlobalException(S3ErrocCode.S3_UPLOAD_ERROR, "파일 업로드 중 오류가 발생했습니다. 에러: " + e.getMessage());
        }

    }
}
