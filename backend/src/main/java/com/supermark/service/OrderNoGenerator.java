package com.supermark.service;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Component
public class OrderNoGenerator {

    private long seq = 0;

    public synchronized String next(String prefix) {
        seq = (seq + 1) % 100000;
        String ts = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        return prefix + ts + String.format("%05d", seq);
    }
}
