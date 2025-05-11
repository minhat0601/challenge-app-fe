'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useMusic } from '@/contexts/music-context';
import { cn } from '@/lib/utils';
import { Disc3, Music } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

// Component nốt nhạc
interface MusicNoteProps {
  style: React.CSSProperties;
}

function MusicNote({ style }: MusicNoteProps) {
  // Sử dụng cả biểu tượng nốt nhạc và dấu thảng
  const musicIcons = [
    <Music key="music" className="h-3 w-3" />,
    <svg key="note1" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 17H5v-2h4v2zm0-4H5v-2h4v2zm0-4H5V7h4v2zm10 4h-4v-2h4v2zm0-4h-4V7h4v2zm0 8h-4v-2h4v2z"/>
    </svg>,
    <svg key="note2" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
    </svg>
  ];

  // Chọn ngẫu nhiên một biểu tượng
  const randomIcon = musicIcons[Math.floor(Math.random() * musicIcons.length)];

  return (
    <div
      className="absolute text-primary/80 animate-float-up pointer-events-none"
      style={style}
    >
      {randomIcon}
    </div>
  );
}

export function MusicPlayerFloat() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    currentSong,
    isPlaying,
    isFloatingPlayerVisible
  } = useMusic();

  // State để quản lý các nốt nhạc
  const [musicNotes, setMusicNotes] = useState<React.CSSProperties[]>([]);
  const notesInterval = useRef<NodeJS.Timeout | null>(null);

  // Kiểm tra xem có phải đang ở trang phòng nghe nhạc không
  const isMusicRoomPage = pathname === '/dashboard/music';

  // Xử lý khi người dùng nhấn vào biểu tượng đĩa nhạc
  const handleGoToMusicRoom = () => {
    router.push('/dashboard/music');
  };

  // Tạo hiệu ứng nốt nhạc bay theo chiều đĩa quay khi đang phát nhạc
  useEffect(() => {
    if (isPlaying) {
      // Tạo nốt nhạc mới thường xuyên hơn (mỗi 800ms)
      notesInterval.current = setInterval(() => {
        // Tạo góc theo chiều đĩa quay (theo chiều kim đồng hồ)
        // Tạo góc ngẫu nhiên trong khoảng hẹp hơn để tạo cảm giác đi theo chiều quay
        const baseAngle = Date.now() / 1000; // Góc thay đổi theo thời gian
        const angle = baseAngle + Math.random() * Math.PI / 4; // Thêm một chút ngẫu nhiên

        // Khoảng cách từ tâm đĩa
        const distance = 15 + Math.random() * 5; // Khoảng cách gần hơn để tạo cảm giác đang phát ra từ đĩa

        // Tính toán vị trí dựa trên góc và khoảng cách
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        // Tính toán hướng bay (tiếp tục theo hướng quay của đĩa)
        const moveAngle = angle + Math.PI / 6; // Thêm một góc nhỏ để tạo cảm giác bay ra xa
        const moveX = Math.cos(moveAngle) * 50; // Bay xa hơn
        const moveY = Math.sin(moveAngle) * 50;

        // Tạo style cho nốt nhạc mới
        const noteStyle: React.CSSProperties = {
          transform: `translate(${x}px, ${y}px)`,
          opacity: 0.8,
          animationDuration: `${1.5 + Math.random()}s`, // Thời gian ngắn hơn để tạo cảm giác nhanh hơn
          '--float-x': `${moveX}px`,
          '--float-y': `${moveY}px`,
          '--random': Math.random().toString(),
        } as React.CSSProperties;

        // Thêm nốt nhạc mới vào danh sách
        setMusicNotes(prev => {
          // Giới hạn số lượng nốt nhạc để tránh quá nhiều
          const newNotes = [...prev, noteStyle];
          if (newNotes.length > 8) {
            return newNotes.slice(-8); // Chỉ giữ 8 nốt nhạc mới nhất
          }
          return newNotes;
        });

        // Xóa nốt nhạc sau khi animation kết thúc
        setTimeout(() => {
          setMusicNotes(prev => prev.filter(note => note !== noteStyle));
        }, 2500); // Thời gian ngắn hơn để phù hợp với animationDuration
      }, 800); // Tạo nốt nhạc thường xuyên hơn
    }

    // Dọn dẹp khi component unmount hoặc khi dừng phát
    return () => {
      if (notesInterval.current) {
        clearInterval(notesInterval.current);
      }
    };
  }, [isPlaying]);

  // Chỉ hiển thị khi không ở trang phòng nghe nhạc, có bài hát và được yêu cầu hiển thị
  const shouldShowPlayer = !isMusicRoomPage && isFloatingPlayerVisible && !!currentSong;

  return shouldShowPlayer ? (
    <div className="fixed bottom-4 right-4 z-[100] w-10 h-10 flex items-center justify-center">
      {/* Hiển thị các nốt nhạc */}
      {isPlaying && musicNotes.map((style, index) => (
        <MusicNote key={index} style={style} />
      ))}

      {/* Nút đĩa nhạc */}
      <button
        onClick={handleGoToMusicRoom}
        className={cn(
          "rounded-full p-3 w-10 h-10 flex items-center justify-center",
          "bg-primary/10 hover:bg-primary/20 border border-primary/20",
          "transition-all duration-300 ease-in-out",
          "shadow-lg hover:shadow-xl",
          isPlaying ? "animate-pulse" : ""
        )}
        title="Đến phòng nghe nhạc"
      >
        <Disc3
          className={cn(
            "h-8 w-8 text-primary",
            isPlaying && "animate-spin"
          )}
        />
      </button>
    </div>
  ) : null;
}
