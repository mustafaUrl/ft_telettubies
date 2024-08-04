export default function drawWinLoseChart(wins, losses) {
    const canvas = document.getElementById('winLoseChart');
    const ctx = canvas.getContext('2d');
  
    const data = [wins, losses];
    const labels = ['Wins', 'Losses'];
    const colors = ['#B6FFFA', '#FFF67E'];
  
    const barWidth = 300;
    const barSpacing = 100;
    const chartHeight = canvas.height - 20;
    const maxDataValue = Math.max(...data);
    const scale = chartHeight / maxDataValue;
  
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '20px Arial';
  
    data.forEach((value, index) => {
      const barHeight = value * scale;
      const x = index * (barWidth + barSpacing) + barSpacing;
      const y = canvas.height - barHeight;
  
      ctx.fillStyle = colors[index];
      ctx.fillRect(x, y, barWidth, barHeight);
  
      ctx.fillStyle = '#000';
      ctx.textAlign = 'center';
      ctx.fillText(labels[index], x + barWidth / 2, canvas.height - 5);
      ctx.fillText(value, x + barWidth / 2, y - 5);
    });
  }