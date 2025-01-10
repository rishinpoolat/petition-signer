import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import cloud from 'd3-cloud';
import type { PetitionStats } from '../../types/dashboard';

interface WordCloudChartProps {
  petitions: PetitionStats[];
}

interface Word {
  text: string;
  size: number;
  rotate?: number;
}

const WordCloudChart: React.FC<WordCloudChartProps> = ({ petitions }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const words = useMemo(() => {
    // Combine all petition titles and content
    const allText = petitions
      .map(petition => `${petition.title} ${petition.content}`)
      .join(' ')
      .toLowerCase();

    // Common words to filter out
    const stopWords = new Set([
      'and', 'the', 'to', 'a', 'of', 'for', 'in', 'on', 'at', 'is', 'it',
      'that', 'this', 'with', 'be', 'have', 'from', 'or', 'by', 'but', 'not',
      'what', 'all', 'when', 'we', 'you', 'can', 'an', 'has', 'are', 'as',
      'been', 'if', 'into', 'which', 'such', 'they', 'no', 'there', 'their',
      'will', 'would', 'make', 'them', 'these', 'should', 'was', 'than'
    ]);

    // Extract and clean words
    const wordsArray = allText
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => 
        word.length > 3 &&
        !stopWords.has(word) &&
        !(/^\d+$/.test(word))
      );

    // Count word frequencies
    const wordFreq: { [key: string]: number } = {};
    wordsArray.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    // Convert to array and map to size
    return Object.entries(wordFreq)
      .map(([text, freq]) => ({
        text,
        size: Math.sqrt(freq) * 10 + 10 // Scale the size
      }))
      .sort((a, b) => b.size - a.size)
      .slice(0, 100);
  }, [petitions]);

  useEffect(() => {
    if (!svgRef.current || !words.length) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    const width = svgRef.current.clientWidth || 800;
    const height = 400;

    const layout = cloud()
      .size([width, height])
      .words(words)
      .padding(5)
      .rotate(() => (~~(Math.random() * 2) - 1) * 90)
      .fontSize(d => (d as Word).size)
      .on("end", draw);

    layout.start();

    function draw(words: Word[]) {
      const svg = d3.select(svgRef.current);
      const color = d3.scaleOrdinal(d3.schemeCategory10);

      const group = svg
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

      group
        .selectAll("text")
        .data(words)
        .enter()
        .append("text")
        .style("font-size", d => `${d.size}px`)
        .style("font-family", "Impact")
        .style("fill", (_, i) => color(i.toString()))
        .attr("text-anchor", "middle")
        .attr("transform", d => `translate(${(d as any).x},${(d as any).y})rotate(${(d as any).rotate})`)
        .text(d => d.text)
        .on("mouseover", function() {
          d3.select(this)
            .transition()
            .style("font-size", d => `${(d as Word).size * 1.2}px`)
            .style("cursor", "pointer");
        })
        .on("mouseout", function() {
          d3.select(this)
            .transition()
            .style("font-size", d => `${(d as Word).size}px`);
        });
    }
  }, [words]);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Popular Topics in Petitions</h3>
      <div className="w-full" style={{ height: "400px" }}>
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          className="w-full h-full"
          viewBox="0 0 800 400"
          preserveAspectRatio="xMidYMid meet"
        />
      </div>
    </div>
  );
};

export default WordCloudChart;