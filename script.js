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

// Handle page loading
function showMainContent() {
  const loadingScreen = document.getElementById('loadingScreen');
  const mainContent = document.getElementById('mainContent');

  // Hide loading screen
  loadingScreen.classList.add('hidden');

  // Show main content after a short delay
  setTimeout(() => {
    mainContent.classList.add('visible');
  }, 300);
}

// Initialize when page content loads
document.addEventListener('DOMContentLoaded', function () {
  init();
  initMobileMenu();

  // Wait exactly 3 seconds then show content
  setTimeout(showMainContent, 3000);
});

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

// Apply images to specific blocks with expanded image support
function applyImageBlocks() {
  const blocks = document.querySelectorAll('.pixel-block');
  const allOccupiedBlocks = getAllOccupiedBlocks();

  // Process each image configuration
  Object.entries(imageConfigs).forEach(([imageName, config]) => {
    const imageGroups = findImageGroups(config.blocks);

    // Apply image class to all blocks for this image first and convert to anchors
    config.blocks.forEach((blockIndex) => {
      if (blockIndex >= 0 && blockIndex < 10000) {
        const oldBlock = blocks[blockIndex];

        // Create new anchor element
        const newAnchor = document.createElement('a');
        newAnchor.className = oldBlock.className + ' logo'; // Keep existing classes and add 'logo'
        newAnchor.dataset.index = oldBlock.dataset.index;
        newAnchor.dataset.row = oldBlock.dataset.row;
        newAnchor.dataset.col = oldBlock.dataset.col;
        newAnchor.dataset.imageType = imageName;
        newAnchor.href = config.url || '#'; // Use URL from config or fallback to '#'
        newAnchor.target = '_blank';
        newAnchor.style.display = 'block'; // Ensure anchor behaves like block element

        // Add hover event listeners to the new anchor
        newAnchor.addEventListener('mouseenter', showBlockInfo);
        newAnchor.addEventListener('mouseleave', hideBlockInfo);

        // Replace the old block with the new anchor
        oldBlock.parentNode.replaceChild(newAnchor, oldBlock);
      }
    });

    // For each group, calculate and apply the expanded image
    imageGroups.forEach((group) => {
      const bounds = getGroupBounds(group);

      group.forEach((blockIndex) => {
        // Find the current block (now might be an anchor)
        const block = canvas.children[blockIndex];
        const coords = indexToCoords(blockIndex);

        // Calculate position within the group
        const relativeRow = coords.row - bounds.minRow;
        const relativeCol = coords.col - bounds.minCol;

        // Calculate background position as percentage
        const backgroundPosX =
          bounds.width > 1 ? (relativeCol / (bounds.width - 1)) * 100 : 50;
        const backgroundPosY =
          bounds.height > 1 ? (relativeRow / (bounds.height - 1)) * 100 : 50;

        // Apply background properties for expanded image
        block.style.backgroundImage = `url('${config.src}')`;
        block.style.backgroundSize = `${bounds.width * 100}% ${
          bounds.height * 100
        }%`;
        block.style.backgroundPosition = `${backgroundPosX}% ${backgroundPosY}%`;
        block.style.backgroundRepeat = 'no-repeat';
      });
    });
  });
}
