import React, { useMemo } from 'react';
import type { PetitionStats } from '../../types/dashboard';

interface WordCloudChartProps {
  petitions: PetitionStats[];
}

interface WordFrequency {
  text: string;
  value: number;
}

const WordCloudChart: React.FC<WordCloudChartProps> = ({ petitions }) => {
  const words = useMemo(() => {
    // Combine all petition titles and content
    const allText = petitions
      .map(petition => `${petition.title} ${petition.content}`)
      .join(' ')
      .toLowerCase();

    // Remove common words and special characters
    const stopWords = new Set(['and', 'the', 'to', 'a', 'of', 'for', 'in', 'on', 'at', 'is', 'it']);
    const words = allText
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word));

    // Count word frequencies
    const wordFreq: { [key: string]: number } = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    // Convert to array of objects and sort by frequency
    return Object.entries(wordFreq)
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 50); // Take top 50 words
  }, [petitions]);

  // Function to determine font size based on frequency
  const getFontSize = (frequency: number) => {
    const minSize = 12;
    const maxSize = 48;
    const maxFreq = Math.max(...words.map(w => w.value));
    return minSize + ((frequency / maxFreq) * (maxSize - minSize));
  };

  // Function to get a color based on frequency
  const getColor = (frequency: number) => {
    const maxFreq = Math.max(...words.map(w => w.value));
    const intensity = Math.floor((frequency / maxFreq) * 255);
    return `rgb(${intensity}, ${Math.floor(intensity/2)}, ${255 - intensity})`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Popular Topics in Petitions</h3>
      <div className="flex flex-wrap justify-center gap-4 p-4 min-h-[300px]">
        {words.map((word, index) => (
          <span
            key={index}
            className="inline-block cursor-pointer transition-transform hover:scale-110"
            style={{
              fontSize: `${getFontSize(word.value)}px`,
              color: getColor(word.value),
              padding: '5px',
              transform: `rotate(${Math.random() * 30 - 15}deg)`,
            }}
            title={`Frequency: ${word.value}`}
          >
            {word.text}
          </span>
        ))}
      </div>
    </div>
  );
};

export default WordCloudChart;