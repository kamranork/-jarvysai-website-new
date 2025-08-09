"use client";
import { useEffect } from "react";
import { FaRobot } from "react-icons/fa";

const cursorId = "ai-cursor";

const AICursor = () => {
  useEffect(() => {
    if (typeof window !== "undefined") {
      let cursorEl = document.getElementById(cursorId);
      if (!cursorEl) {
        cursorEl = document.createElement("div");
        cursorEl.id = cursorId;
        cursorEl.style.position = "fixed";
        cursorEl.style.pointerEvents = "none";
        cursorEl.style.zIndex = "9999";
        cursorEl.style.width = "28px";
        cursorEl.style.height = "28px";
        cursorEl.style.display = "flex";
        cursorEl.style.alignItems = "center";
        cursorEl.style.justifyContent = "center";
        cursorEl.style.transition = "opacity 0.2s";
        cursorEl.style.opacity = "0.7";
        cursorEl.innerHTML = '';
        document.body.appendChild(cursorEl);
      }
      // Lightweight minimal cursor: small cyan dot, no SVG, no animation
      cursorEl.innerHTML = '';
      const dot = document.createElement('div');
      dot.style.width = '12px';
      dot.style.height = '12px';
      dot.style.borderRadius = '50%';
      dot.style.background = '#00e6fe';
      dot.style.boxShadow = '0 0 4px #00e6fe80';
      dot.style.opacity = '0.7';
      cursorEl.appendChild(dot);
      let mouseX = 0, mouseY = 0, curX = 0, curY = 0;
      const moveCursor = (e: MouseEvent) => {
        mouseX = e.clientX - 6;
        mouseY = e.clientY - 6;
      };
      // Throttle to 30fps for performance
      let lastFrame = 0;
      const animate = (now = 0) => {
        if (now - lastFrame > 33) { // ~30fps
          curX += (mouseX - curX) * 0.5;
          curY += (mouseY - curY) * 0.5;
          if (cursorEl) {
            cursorEl.style.left = `${curX}px`;
            cursorEl.style.top = `${curY}px`;
          }
          lastFrame = now;
        }
        requestAnimationFrame(animate);
      };
      window.addEventListener("mousemove", moveCursor);
      animate();
      return () => window.removeEventListener("mousemove", moveCursor);
    }
  }, []);
  return null;
};

export default AICursor; 