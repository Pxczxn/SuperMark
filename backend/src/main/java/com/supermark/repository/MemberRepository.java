package com.supermark.repository;

import com.supermark.domain.Member;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {

    Optional<Member> findByPhone(String phone);

    boolean existsByPhone(String phone);

    @Query("SELECT m FROM Member m WHERE (:keyword IS NULL OR :keyword = '' OR m.name LIKE %:keyword% OR m.phone LIKE %:keyword%) "
            + "AND (:phone IS NULL OR :phone = '' OR m.phone LIKE %:phone%)")
    Page<Member> search(@Param("keyword") String keyword,
                        @Param("phone") String phone,
                        Pageable pageable);
}
