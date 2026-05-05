/*
 * mobile.holo.ts
 * Purpose: Local mobile holo-card canvas generator used by the mobile flow.
 */
import { lighten } from './mobile.logic';

export type MobileHoloCardOptions = {
  mbti: string;
  color: string;
  nickname?: string;
  phrase?: string;
  width?: number;
  height?: number;
};

function roundRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}

export function generateMobileHoloCardImage(opts: MobileHoloCardOptions): string | null {
  if (typeof document === 'undefined') return null;

  const { mbti, color, nickname, phrase, width = 1080, height = 1920 } = opts;
  const canvasWidth = width;
  const canvasHeight = height;
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const context = canvas.getContext('2d');
  if (!context) return null;

  const pageBackground = context.createRadialGradient(canvasWidth * 0.5, 0, 0, canvasWidth * 0.5, canvasHeight * 0.3, canvasWidth);
  pageBackground.addColorStop(0, '#ffffff');
  pageBackground.addColorStop(1, '#f4f5f8');
  context.fillStyle = pageBackground;
  context.fillRect(0, 0, canvasWidth, canvasHeight);

  const cardWidth = canvasWidth - 120;
  const cardHeight = canvasHeight - 220;
  const cardX = (canvasWidth - cardWidth) / 2;
  const cardY = (canvasHeight - cardHeight) / 2 - 20;
  const radius = 56;

  context.save();
  context.shadowColor = 'rgba(40,50,80,0.22)';
  context.shadowBlur = 80;
  context.shadowOffsetY = 30;
  context.fillStyle = '#ffffff';
  roundRect(context, cardX, cardY, cardWidth, cardHeight, radius);
  context.fill();
  context.restore();

  context.save();
  roundRect(context, cardX, cardY, cardWidth, cardHeight, radius);
  context.clip();

  const top = lighten(color, 0.55);
  const upper = lighten(color, 0.25);
  const mid = color;
  const gradient = context.createLinearGradient(0, cardY, 0, cardY + cardHeight);
  gradient.addColorStop(0, top);
  gradient.addColorStop(0.35, upper);
  gradient.addColorStop(0.75, mid);
  gradient.addColorStop(1, mid);
  context.fillStyle = gradient;
  context.fillRect(cardX, cardY, cardWidth, cardHeight);

  const highlight = context.createLinearGradient(0, cardY, 0, cardY + cardHeight * 0.4);
  highlight.addColorStop(0, 'rgba(255,255,255,0.28)');
  highlight.addColorStop(1, 'rgba(255,255,255,0)');
  context.fillStyle = highlight;
  context.fillRect(cardX, cardY, cardWidth, cardHeight * 0.4);

  context.textBaseline = 'top';
  context.textAlign = 'left';
  context.fillStyle = 'rgba(255,255,255,0.95)';
  context.font = '600 26px Inter, sans-serif';
  context.fillText('INKLUMINA', cardX + 60, cardY + 60);
  context.fillStyle = 'rgba(255,255,255,0.75)';
  context.font = '300 22px Inter, sans-serif';
  context.fillText('MBTI · PARTICLE ART', cardX + 60, cardY + 96);

  const now = new Date();
  const timestamp = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
  context.textAlign = 'right';
  context.fillStyle = 'rgba(255,255,255,0.75)';
  context.font = '300 22px Inter, sans-serif';
  context.fillText(timestamp, cardX + cardWidth - 60, cardY + 96);
  context.fillStyle = 'rgba(255,255,255,0.95)';
  context.font = '600 26px Inter, sans-serif';
  context.fillText('Sixteen Personalities', cardX + cardWidth - 60, cardY + 60);

  context.textAlign = 'center';
  context.textBaseline = 'middle';
  const centerY = cardY + cardHeight * 0.42;
  context.fillStyle = 'rgba(0,0,0,0.18)';
  context.font = '900 360px Inter, Arial Black, sans-serif';
  context.fillText(mbti, canvasWidth / 2 + 6, centerY + 8);
  context.fillStyle = '#ffffff';
  context.fillText(mbti, canvasWidth / 2, centerY);

  if (nickname) {
    context.fillStyle = 'rgba(255,255,255,0.98)';
    context.font = '500 72px "PingFang SC", "Hiragino Sans GB", sans-serif';
    context.fillText(nickname, canvasWidth / 2, cardY + cardHeight * 0.7);
  }

  if (phrase) {
    context.fillStyle = 'rgba(255,255,255,0.8)';
    context.font = '300 44px "PingFang SC", "Hiragino Sans GB", serif';
    context.fillText(phrase, canvasWidth / 2, cardY + cardHeight * 0.76);
  }

  context.textBaseline = 'bottom';
  context.textAlign = 'left';
  context.fillStyle = 'rgba(255,255,255,0.65)';
  context.font = '300 18px Inter, sans-serif';
  context.fillText('INSIDE OUT THE COLOR', cardX + 60, cardY + cardHeight - 95);
  context.fillStyle = 'rgba(255,255,255,0.9)';
  context.font = '600 28px Inter, sans-serif';
  context.fillText(mbti, cardX + 60, cardY + cardHeight - 60);
  context.textAlign = 'right';
  context.fillStyle = 'rgba(255,255,255,0.6)';
  context.font = '300 18px Inter, sans-serif';
  context.fillText('inklumina.live', cardX + cardWidth - 60, cardY + cardHeight - 95);
  context.fillStyle = 'rgba(255,255,255,0.95)';
  context.font = '500 28px Inter, sans-serif';
  context.fillText('@snowfallsout', cardX + cardWidth - 60, cardY + cardHeight - 60);

  context.restore();

  context.save();
  roundRect(context, cardX, cardY, cardWidth, cardHeight, radius);
  context.clip();
  context.globalAlpha = 0.06;

  for (let index = 0; index < 1500; index += 1) {
    context.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#000000';
    context.fillRect(cardX + Math.random() * cardWidth, cardY + Math.random() * cardHeight, 1.5, 1.5);
  }

  context.restore();

  return canvas.toDataURL('image/jpeg', 0.92);
}