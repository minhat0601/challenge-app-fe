import confetti from 'canvas-confetti';

/**
 * Hiển thị hiệu ứng confetti trên màn hình
 * @param duration Thời gian hiệu ứng kéo dài (ms)
 * @param particleCount Số lượng hạt confetti
 */
export const showConfetti = (duration = 3000, particleCount = 200) => {
  // Tạo hiệu ứng confetti từ nhiều hướng
  const end = Date.now() + duration;

  // Tạo hiệu ứng từ góc trái
  confetti({
    particleCount: particleCount / 2,
    spread: 60,
    origin: { x: 0, y: 0.5 },
    colors: ['#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3'],
  });

  // Tạo hiệu ứng từ góc phải
  confetti({
    particleCount: particleCount / 2,
    spread: 60,
    origin: { x: 1, y: 0.5 },
    colors: ['#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3'],
  });

  // Tạo hiệu ứng từ giữa trên cùng
  confetti({
    particleCount: particleCount / 2,
    spread: 120,
    origin: { x: 0.5, y: 0 },
    colors: ['#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3'],
  });
};