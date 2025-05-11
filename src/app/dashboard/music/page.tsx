'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';
import { ModernPlayer } from '@/components/music/modern-player';
import { SongList } from '@/components/music/song-list';
import { ChatSection } from '@/components/music/chat-section';
import { useMusic } from '@/contexts/music-context';

// Dữ liệu mẫu cho danh sách nhạc
const MOCK_SONGS = [
  {
    id: 1,
    title: 'Hà Nội Mùa Vắng Những Cơn Mưa',
    artist: 'Phan Mạnh Quỳnh',
    duration: 289, // seconds
    coverUrl: 'https://i.ytimg.com/vi/EPLgMdq1NBI/maxresdefault.jpg',
    votes: 24,
    votedBy: ['user1', 'user2', 'user3']
  },
  {
    id: 2,
    title: 'Có Chàng Trai Viết Lên Cây',
    artist: 'Phan Mạnh Quỳnh',
    duration: 267,
    coverUrl: 'https://i.ytimg.com/vi/0VC6euBtKkk/maxresdefault.jpg',
    votes: 18,
    votedBy: ['user4', 'user5']
  },
  {
    id: 3,
    title: 'Khi Người Mình Yêu Khóc',
    artist: 'Phan Mạnh Quỳnh',
    duration: 302,
    coverUrl: 'https://i.ytimg.com/vi/HZi4eJXWZU0/maxresdefault.jpg',
    votes: 15,
    votedBy: []
  },
  {
    id: 4,
    title: 'Từ Đó',
    artist: 'Phan Mạnh Quỳnh',
    duration: 274,
    coverUrl: 'https://i.ytimg.com/vi/O_X2qZJJLgk/maxresdefault.jpg',
    votes: 12,
    votedBy: []
  },
  {
    id: 5,
    title: 'Nước Ngoài',
    artist: 'Phan Mạnh Quỳnh',
    duration: 256,
    coverUrl: 'https://i.ytimg.com/vi/FuS2EoGLqTM/maxresdefault.jpg',
    votes: 9,
    votedBy: []
  }
];

// Dữ liệu mẫu cho người dùng đang online
const MOCK_ONLINE_USERS = [
  { id: 'user1', name: 'Minh Nhật', avatar: 'https://i.pravatar.cc/150?img=1', rank: 'gold' },
  { id: 'user2', name: 'Hồng Anh', avatar: 'https://i.pravatar.cc/150?img=5', rank: 'silver' },
  { id: 'user3', name: 'Quang Huy', avatar: 'https://i.pravatar.cc/150?img=3', rank: 'bronze' },
  { id: 'user4', name: 'Thanh Tâm', avatar: 'https://i.pravatar.cc/150?img=4', rank: 'default' },
  { id: 'user5', name: 'Minh Tuấn', avatar: 'https://i.pravatar.cc/150?img=7', rank: 'diamond' },
  { id: 'user6', name: 'Thùy Linh', avatar: 'https://i.pravatar.cc/150?img=9', rank: 'default' },
  { id: 'user7', name: 'Văn Đức', avatar: 'https://i.pravatar.cc/150?img=11', rank: 'bronze' },
  { id: 'user8', name: 'Hải Yến', avatar: 'https://i.pravatar.cc/150?img=13', rank: 'silver' }
];

// Dữ liệu mẫu cho bình luận
const MOCK_COMMENTS = [
  { id: 1, userId: 'user1', userName: 'Minh Nhật', userAvatar: 'https://i.pravatar.cc/150?img=1', userRank: 'gold', content: 'Bài hát này hay quá!', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
  { id: 2, userId: 'user2', userName: 'Hồng Anh', userAvatar: 'https://i.pravatar.cc/150?img=5', userRank: 'silver', content: 'Tôi thích giai điệu của bài này', timestamp: new Date(Date.now() - 1000 * 60 * 4) },
  { id: 3, userId: 'user3', userName: 'Quang Huy', userAvatar: 'https://i.pravatar.cc/150?img=3', userRank: 'bronze', content: 'Phan Mạnh Quỳnh là ca sĩ yêu thích của tôi', timestamp: new Date(Date.now() - 1000 * 60 * 3) },
  { id: 4, userId: 'user5', userName: 'Minh Tuấn', userAvatar: 'https://i.pravatar.cc/150?img=7', userRank: 'diamond', content: 'Ai đang nghe cùng không?', timestamp: new Date(Date.now() - 1000 * 60 * 2) },
  { id: 5, userId: 'user4', userName: 'Thanh Tâm', userAvatar: 'https://i.pravatar.cc/150?img=4', userRank: 'default', content: 'Tôi đang nghe cùng bạn đây!', timestamp: new Date(Date.now() - 1000 * 60 * 1) }
];

// Hàm chuyển đổi giây thành định dạng mm:ss
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export default function MusicPage() {
  const { user } = useAuthStore();
  const {
    currentSong, setCurrentSong,
    isPlaying, setIsPlaying,
    currentTime, setCurrentTime,
    volume, setVolume,
    isMuted, setIsMuted,
    listeners, setListeners,
    showFloatingPlayer
  } = useMusic();

  const [songs, setSongs] = useState(MOCK_SONGS);
  const [onlineUsers, setOnlineUsers] = useState(MOCK_ONLINE_USERS);
  const [comments, setComments] = useState(MOCK_COMMENTS);
  const [newComment, setNewComment] = useState('');

  // Khi vào trang, cập nhật bài hát và số người nghe
  useEffect(() => {
    // Cập nhật bài hát hiện tại nếu chưa có
    if (!currentSong) {
      setCurrentSong(MOCK_SONGS[0]);
    }

    // Cập nhật số người nghe
    setListeners(MOCK_ONLINE_USERS.length);

    // Khi rời khỏi trang, hiển thị floating player
    return () => {
      showFloatingPlayer();
    };
  }, []);

  // Mô phỏng Socket.IO: thêm người dùng mới ngẫu nhiên
  useEffect(() => {
    const interval = setInterval(() => {
      // 20% cơ hội có người dùng mới tham gia
      if (Math.random() < 0.2) {
        const newUser = {
          id: `user${Math.floor(Math.random() * 1000)}`,
          name: `Người dùng ${Math.floor(Math.random() * 100)}`,
          avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
          rank: ['default', 'bronze', 'silver', 'gold', 'diamond'][Math.floor(Math.random() * 5)] as any
        };

        setOnlineUsers(prev => [...prev, newUser]);
        setListeners(prev => prev + 1);

        // Thông báo người dùng mới
        toast.info(`${newUser.name} đã tham gia phòng nghe nhạc!`);
      }

      // 10% cơ hội có người dùng rời đi
      if (Math.random() < 0.1 && onlineUsers.length > 5) {
        const indexToRemove = Math.floor(Math.random() * (onlineUsers.length - 5)) + 5;
        const userToRemove = onlineUsers[indexToRemove];

        setOnlineUsers(prev => prev.filter((_, i) => i !== indexToRemove));
        setListeners(prev => prev - 1);

        // Thông báo người dùng rời đi
        toast(`${userToRemove.name} đã rời phòng nghe nhạc`);
      }
    }, 15000); // Mỗi 15 giây

    return () => clearInterval(interval);
  }, [onlineUsers, setListeners]);

  // Mô phỏng Socket.IO: thêm bình luận mới ngẫu nhiên
  useEffect(() => {
    const interval = setInterval(() => {
      // 30% cơ hội có bình luận mới
      if (Math.random() < 0.3) {
        const randomUser = onlineUsers[Math.floor(Math.random() * onlineUsers.length)];
        const randomComments = [
          'Bài hát này thật tuyệt!',
          'Tôi yêu giai điệu này',
          'Ai đang nghe cùng không?',
          'Bài tiếp theo là gì vậy?',
          'Vote cho bài tiếp theo đi mọi người',
          'Âm nhạc thật tuyệt vời',
          'Tôi đang học bài và nghe nhạc',
          'Bài này làm tôi nhớ về kỷ niệm xưa',
          'Phan Mạnh Quỳnh hát hay quá',
          'Ai thích nhạc Việt Nam không?'
        ];

        const newComment = {
          id: Date.now(),
          userId: randomUser.id,
          userName: randomUser.name,
          userAvatar: randomUser.avatar,
          userRank: randomUser.rank,
          content: randomComments[Math.floor(Math.random() * randomComments.length)],
          timestamp: new Date()
        };

        setComments(prev => [...prev, newComment]);
      }
    }, 10000); // Mỗi 10 giây

    return () => clearInterval(interval);
  }, [onlineUsers]);

  // Cuộn xuống bình luận mới nhất đã được xử lý trong component ChatSection

  // Mô phỏng Socket.IO: cập nhật vote ngẫu nhiên
  useEffect(() => {
    const interval = setInterval(() => {
      // 20% cơ hội có vote mới
      if (Math.random() < 0.2) {
        const randomSongIndex = Math.floor(Math.random() * (songs.length - 1)) + 1; // Không vote cho bài đang phát
        const randomUser = onlineUsers[Math.floor(Math.random() * onlineUsers.length)];

        setSongs(prev => prev.map((song, index) => {
          if (index === randomSongIndex && !song.votedBy.includes(randomUser.id)) {
            return {
              ...song,
              votes: song.votes + 1,
              votedBy: [...song.votedBy, randomUser.id]
            };
          }
          return song;
        }));
      }
    }, 8000); // Mỗi 8 giây

    return () => clearInterval(interval);
  }, [songs, onlineUsers]);

  // Xử lý khi người dùng vote cho bài hát
  const handleVote = (songId: number) => {
    if (!user) return;

    setSongs(prev => prev.map(song => {
      if (song.id === songId) {
        // Kiểm tra xem người dùng đã vote chưa
        if (song.votedBy.includes(user.id)) {
          toast.error('Bạn đã vote cho bài hát này rồi!');
          return song;
        }

        toast.success(`Đã vote cho bài "${song.title}"`);
        return {
          ...song,
          votes: song.votes + 1,
          votedBy: [...song.votedBy, user.id]
        };
      }
      return song;
    }));
  };

  // Xử lý khi người dùng gửi bình luận
  const handleSendComment = () => {
    if (!newComment.trim() || !user) return;

    const comment = {
      id: Date.now(),
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      userRank: 'default', // Giả sử rank mặc định
      content: newComment,
      timestamp: new Date()
    };

    setComments(prev => [...prev, comment]);
    setNewComment('');
  };

  // Xử lý khi người dùng nhấn phím Enter để gửi bình luận
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendComment();
    }
  };

  // Xử lý khi người dùng thay đổi âm lượng
  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    if (value[0] === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  // Xử lý khi người dùng bật/tắt âm thanh
  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  // Xử lý khi người dùng bật/tắt phát nhạc
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Xử lý khi người dùng thay đổi vị trí phát
  const handleSeek = (value: number[]) => {
    setCurrentTime(value[0]);
  };

  // Xử lý khi người dùng chuyển bài tiếp theo
  const handleSkipNext = () => {
    // Sắp xếp bài hát theo số vote (trừ bài đang phát)
    const sortedSongs = [...songs]
      .filter(song => song.id !== currentSong.id)
      .sort((a, b) => b.votes - a.votes);

    if (sortedSongs.length > 0) {
      // Chọn bài có nhiều vote nhất
      const nextSong = sortedSongs[0];
      setCurrentSong(nextSong);
      setCurrentTime(0);

      // Xóa bài hát đã phát khỏi danh sách vote
      setSongs(prev => prev.filter(song => song.id !== nextSong.id));

      // Thông báo
      toast.info(`Đang phát: ${nextSong.title} - ${nextSong.artist}`);
    }
  };

  // Xử lý khi người dùng quay lại bài trước
  const handleSkipPrevious = () => {
    // Trong thực tế, cần lưu lịch sử phát
    toast.info('Tính năng này chưa được hỗ trợ trong phiên bản demo');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Phòng nghe nhạc</h1>
      </div>

      {/* Hàng 1: Music Player với hiệu ứng phát sáng */}
      <div className="mb-8 transform hover:scale-[1.01] transition-transform duration-300 max-w-full">
        <ModernPlayer
          currentSong={currentSong}
          isPlaying={isPlaying}
          currentTime={currentTime}
          volume={volume}
          isMuted={isMuted}
          onPlayPause={handlePlayPause}
          onSkipNext={handleSkipNext}
          onSkipPrevious={handleSkipPrevious}
          onSeek={handleSeek}
          onVolumeChange={handleVolumeChange}
          onMuteToggle={handleMuteToggle}
          listeners={listeners}
        />
      </div>

      {/* Hàng 2: Chia 2 cột cho bình luận và bình chọn nhạc */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Cột 1: Bình luận và người dùng online */}
        <div className="transform hover:translate-y-[-2px] transition-transform duration-300">
          <ChatSection
            comments={comments}
            onlineUsers={onlineUsers}
            newComment={newComment}
            onNewCommentChange={(value) => setNewComment(value)}
            onSendComment={handleSendComment}
            onKeyPress={handleKeyPress}
          />
        </div>

        {/* Cột 2: Danh sách bài hát sắp tới */}
        <div className="transform hover:translate-y-[-2px] transition-transform duration-300">
          <SongList
            songs={songs}
            currentSongId={currentSong.id}
            onVote={handleVote}
            userId={user?.id}
          />
        </div>
      </div>
    </div>
  );
}
