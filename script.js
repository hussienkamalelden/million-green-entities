let canvas;

// Get all occupied blocks from all images
function getAllOccupiedBlocks() {
  const allBlocks = [];
  Object.values(imageConfigs).forEach((config) => {
    allBlocks.push(...config.blocks);
  });
  return allBlocks;
}

// Initialize the application
function init() {
  canvas = document.getElementById('pixelCanvas');
  createBlocks();
  applyImageBlocks();
}

// Create 10,000 blocks (100x100 grid)
function createBlocks() {
  for (let i = 0; i < 10000; i++) {
    const block = document.createElement('div');
    block.className = 'pixel-block';
    block.dataset.index = i;
    block.dataset.row = Math.floor(i / 100);
    block.dataset.col = i % 100;

    // Add hover event listeners
    block.addEventListener('mouseenter', showBlockInfo);
    block.addEventListener('mouseleave', hideBlockInfo);

    canvas.appendChild(block);
  }
}

// Show block info above grid
function showBlockInfo(event) {
  const block = event.target;
  const blockIndex = parseInt(block.dataset.index);
  const allOccupiedBlocks = getAllOccupiedBlocks();
  const isOccupied = allOccupiedBlocks.includes(blockIndex);

  const blockInfoTop = document.getElementById('blockInfoTop');
  const blockNumberTop = document.getElementById('blockNumberTop');
  const blockStatusTop = document.getElementById('blockStatusTop');

  blockNumberTop.textContent = blockIndex;

  if (isOccupied) {
    blockStatusTop.textContent = 'Unavailable';
    blockStatusTop.className = 'status unavailable';
  } else {
    blockStatusTop.textContent = 'Available';
    blockStatusTop.className = 'status available';
  }

  blockInfoTop.classList.add('visible');
}

// Hide block info
function hideBlockInfo() {
  const blockInfoTop = document.getElementById('blockInfoTop');
  blockInfoTop.classList.remove('visible');
}

// Handle page loading with animated pixel grid
function initLoader() {
  const pixelGrid = document.getElementById('pixelGrid');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');

  // Generate pixel grid (12x8 = 96 pixels on desktop)
  const gridCols =
    window.innerWidth <= 480 ? 8 : window.innerWidth <= 768 ? 10 : 12;
  const gridRows =
    window.innerWidth <= 480 ? 5 : window.innerWidth <= 768 ? 6 : 8;
  const totalPixels = gridCols * gridRows;

  // Clear existing pixels
  pixelGrid.innerHTML = '';

  // Create pixel elements
  for (let i = 0; i < totalPixels; i++) {
    const pixel = document.createElement('div');
    pixel.className = 'pixel-item';
    pixel.style.animationDelay = `${i * 0.02 + Math.random() * 0.1}s`;
    pixelGrid.appendChild(pixel);
  }

  // Start progress animation
  animateProgress(progressFill, progressText, totalPixels);
}

function animateProgress(progressFill, progressText, totalPixels) {
  let progress = 0;
  const duration = 2500; // Total animation duration
  const interval = duration / 100; // Update every 1% of progress

  const progressInterval = setInterval(() => {
    progress += 1 + Math.random() * 2; // Variable progress increments

    if (progress >= 100) {
      progress = 100;
      clearInterval(progressInterval);

      // Complete the loading sequence
      setTimeout(() => {
        completeLoading();
      }, 500);
    }

    // Update progress bar and text
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `${Math.floor(progress)}%`;
  }, interval);
}

function completeLoading() {
  const loadingScreen = document.getElementById('loadingScreen');
  const mainContent = document.getElementById('mainContent');

  // Add completion effect to pixels
  const pixels = document.querySelectorAll('.pixel-item');
  pixels.forEach((pixel, index) => {
    setTimeout(() => {
      pixel.style.transform = 'scale(0)';
      pixel.style.opacity = '0';
    }, index * 5);
  });

  // Hide loading screen with fade out
  setTimeout(() => {
    loadingScreen.classList.add('hidden');

    // Show main content
    setTimeout(() => {
      mainContent.classList.add('visible');
    }, 300);
  }, 800);
}

// Initialize loader when called
function showMainContent() {
  // Start the animated loader sequence
  initLoader();
}

// Initialize when page content loads
document.addEventListener('DOMContentLoaded', function () {
  init();
  initMobileMenu();
  initFooterStats();

  // Wait exactly 3 seconds then show content
  setTimeout(showMainContent, 3000);
});

// Animate footer statistics
function initFooterStats() {
  const entitiesCount = document.getElementById('entitiesCount');
  if (entitiesCount) {
    animateCounter(entitiesCount, 0, Object.keys(imageConfigs).length, 2000);
  }
}

function animateCounter(element, start, end, duration) {
  let startTime = null;

  function animate(currentTime) {
    if (startTime === null) startTime = currentTime;
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const value = Math.floor(progress * (end - start) + start);
    element.textContent = value;

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  // Start animation after a delay when footer is visible
  setTimeout(() => {
    requestAnimationFrame(animate);
  }, 1000);
}

// Mobile menu functionality
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    // Close menu when clicking on nav links
    document.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
      }
    });
  }
}

// Convert block index to row/col coordinates
function indexToCoords(index) {
  return {
    row: Math.floor(index / 100),
    col: index % 100,
  };
}

// Convert row/col coordinates to block index
function coordsToIndex(row, col) {
  return row * 100 + col;
}

// Find connected groups of blocks for a specific image
function findImageGroups(blocks) {
  const visited = new Set();
  const groups = [];

  blocks.forEach((blockIndex) => {
    if (!visited.has(blockIndex)) {
      const group = [];
      const queue = [blockIndex];
      visited.add(blockIndex);

      while (queue.length > 0) {
        const currentIndex = queue.shift();
        group.push(currentIndex);

        const coords = indexToCoords(currentIndex);

        // Check adjacent blocks (4-directional: up, down, left, right)
        const adjacentCoords = [
          { row: coords.row - 1, col: coords.col }, // up
          { row: coords.row + 1, col: coords.col }, // down
          { row: coords.row, col: coords.col - 1 }, // left
          { row: coords.row, col: coords.col + 1 }, // right
        ];

        adjacentCoords.forEach((adjCoords) => {
          if (
            adjCoords.row >= 0 &&
            adjCoords.row < 100 &&
            adjCoords.col >= 0 &&
            adjCoords.col < 100
          ) {
            const adjIndex = coordsToIndex(adjCoords.row, adjCoords.col);

            if (blocks.includes(adjIndex) && !visited.has(adjIndex)) {
              visited.add(adjIndex);
              queue.push(adjIndex);
            }
          }
        });
      }

      groups.push(group);
    }
  });

  return groups;
}

// Calculate bounding rectangle for a group of blocks
function getGroupBounds(group) {
  const coords = group.map(indexToCoords);

  const minRow = Math.min(...coords.map((c) => c.row));
  const maxRow = Math.max(...coords.map((c) => c.row));
  const minCol = Math.min(...coords.map((c) => c.col));
  const maxCol = Math.max(...coords.map((c) => c.col));

  return {
    minRow,
    maxRow,
    minCol,
    maxCol,
    width: maxCol - minCol + 1,
    height: maxRow - minRow + 1,
  };
}

// Apply images to specific blocks with object-fit cover support
function applyImageBlocks() {
  const blocks = document.querySelectorAll('.pixel-block');
  const allOccupiedBlocks = getAllOccupiedBlocks();

  // Process each image configuration
  Object.entries(imageConfigs).forEach(([imageName, config]) => {
    const imageGroups = findImageGroups(config.blocks);

    // Mark all blocks for this image as occupied
    config.blocks.forEach((blockIndex) => {
      if (blockIndex >= 0 && blockIndex < 10000) {
        const oldBlock = blocks[blockIndex];
        oldBlock.classList.add('logo');
        oldBlock.dataset.imageType = imageName;
      }
    });

    // For each group, create a single image with object-fit cover
    imageGroups.forEach((group, groupIndex) => {
      const bounds = getGroupBounds(group);

      // Create a container div for the image group
      const imageContainer = document.createElement('a');
      imageContainer.href = config.url || '#';
      imageContainer.target = '_blank';
      imageContainer.className = 'image-container';
      imageContainer.dataset.imageType = imageName;

      // Calculate container position and size
      const containerLeft = (bounds.minCol / 100) * 100;
      const containerTop = (bounds.minRow / 100) * 100;
      const containerWidth = bounds.width;
      const containerHeight = bounds.height;

      // Style the container
      imageContainer.style.position = 'absolute';
      imageContainer.style.left = `${containerLeft}%`;
      imageContainer.style.top = `${containerTop}%`;
      imageContainer.style.width = `${containerWidth}%`;
      imageContainer.style.height = `${containerHeight}%`;
      imageContainer.style.zIndex = '2';
      imageContainer.style.display = 'block';

      // Create the image element
      const img = document.createElement('img');
      img.src = config.src;
      img.alt = `Green Entity ${imageName}`;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.display = 'block';
      img.style.borderRadius = 'inherit';

      // Add hover event listeners to the container
      imageContainer.addEventListener('mouseenter', (e) => {
        // Find the first block in this group for hover info
        const firstBlockIndex = group[0];
        const firstBlock = blocks[firstBlockIndex];
        if (firstBlock) {
          showBlockInfo({ target: firstBlock });
        }
      });

      imageContainer.addEventListener('mouseleave', hideBlockInfo);

      // Append image to container
      imageContainer.appendChild(img);

      // Append container to canvas
      canvas.appendChild(imageContainer);
    });
  });
}
