// DOM Elements
const htmlCode = document.getElementById('html-code');
const cssCode = document.getElementById('css-code');
const jsCode = document.getElementById('js-code');
const resultFrame = document.getElementById('result-frame');
const runBtn = document.getElementById('run-btn');
const saveBtn = document.getElementById('save-btn');
const clearBtn = document.getElementById('clear-btn');

// Layout elements
const container = document.querySelector('.container');
const layoutHorizontalBtn = document.getElementById('layout-horizontal');
const layoutVerticalBtn = document.getElementById('layout-vertical');
const layoutGridBtn = document.getElementById('layout-grid');
const layoutResultOnlyBtn = document.getElementById('layout-result-only');
const layoutButtons = document.querySelectorAll('.layout-btn');

// Resize elements
const resultPanel = document.querySelector('.result');
const resizeSmaller = document.getElementById('resize-smaller');
const resizeLarger = document.getElementById('resize-larger');
const sizePercentageInput = document.getElementById('size-percentage');

// Default width percentage and step for resizing
let currentWidthPercentage = 50;
const resizeStep = 5; // Percentage to resize by each click
const minWidth = 20; // Minimum width percentage
const maxWidth = 100; // Maximum width percentage

// Default starter code
const defaultHTML = `<!DOCTYPE html>
<html>
<head>
    <title>My CodePen</title>
</head>
<body>
    <h1>Welcome to GL-Code Platform</h1>
    <p>Start editing to see some magic happen!</p>
    <div class="box"></div>
</body>
</html>`;

const defaultCSS = `body {
    font-family: Arial, sans-serif;
    text-align: center;
    background-color: #f0f0f0;
    padding: 20px;
}

h1 {
    color: #333;
}

.box {
    width: 100px;
    height: 100px;
    background-color: #61dafb;
    margin: 0 auto;
    transition: all 0.3s ease;
}

.box:hover {
    transform: rotate(45deg);
    background-color: #ff6b6b;
}`;

const defaultJS = `// You can write JavaScript here
document.querySelector("h1").addEventListener("click", function() {
    this.style.color = "#" + Math.floor(Math.random()*16777215).toString(16);
});

// Animation example
const box = document.querySelector(".box");
box.addEventListener("click", function() {
    this.style.borderRadius = this.style.borderRadius === "50%" ? "0" : "50%";
});`;

// Function to run the code and show output
function runCode() {
    // Get the iframe's document
    const iframe = resultFrame.contentWindow.document;
    
    // Clear the iframe
    iframe.open();
    
    // Write the HTML code with embedded CSS and JS
    iframe.write(`
        ${htmlCode.value}
        <style>${cssCode.value}</style>
        <script>${jsCode.value}</script>
    `);
    
    // Close the document
    iframe.close();
}

// Function to reset editors to default code
function resetToDefault() {
    // Set the values directly
    htmlCode.value = defaultHTML;
    cssCode.value = defaultCSS;
    jsCode.value = defaultJS;
    
    // Clear localStorage items
    localStorage.removeItem('codepen-html');
    localStorage.removeItem('codepen-css');
    localStorage.removeItem('codepen-js');
    
    // Run the code to update the output
    runCode();
    
    console.log("Code cleared and reset to default!");
}

// Function to apply width to result panel
function applyResultWidth(percentage) {
    // Ensure percentage is within limits
    percentage = Math.max(minWidth, Math.min(maxWidth, percentage));
    currentWidthPercentage = percentage;
    
    // Force immediate DOM reflow with getComputedStyle
    window.getComputedStyle(resultPanel).width;
    
    // Apply width with !important to override other styles
    resultPanel.style.cssText = `width: ${percentage}% !important`;
    
    // Update display input
    sizePercentageInput.value = percentage;
    
    // Force reflow again
    window.getComputedStyle(resultPanel).width;
    
    console.log(`Applied width: ${percentage}% with direct DOM manipulation`);
}

// Function to resize the result panel
function resizeResultPanel(direction) {
    // Skip resizing in grid layout as it's controlled by CSS grid
    if (container.getAttribute('data-layout') === 'grid') {
        return;
    }
    
    // Update width percentage based on direction
    if (direction === 'smaller' && currentWidthPercentage > minWidth) {
        currentWidthPercentage -= resizeStep;
    } else if (direction === 'larger' && currentWidthPercentage < maxWidth) {
        currentWidthPercentage += resizeStep;
    }
    
    // Apply the new width immediately
    applyResultWidth(currentWidthPercentage);
    
    // Save the width preference to localStorage
    localStorage.setItem('gl-code-result-width', currentWidthPercentage);
}

// Function to handle direct input of width percentage
function handleDirectPercentageInput() {
    let value = parseInt(sizePercentageInput.value);
    
    // Validate the input
    if (isNaN(value)) {
        value = currentWidthPercentage;
    } else {
        value = Math.max(minWidth, Math.min(maxWidth, value));
    }
    
    // Apply the width only if it's different
    if (value !== currentWidthPercentage) {
        applyResultWidth(value);
        
        // Save the width preference to localStorage
        localStorage.setItem('gl-code-result-width', value);
    }
    
    // Always set the input to the current value (handles validation)
    sizePercentageInput.value = currentWidthPercentage;
}

// Layout switching function
function switchLayout(layoutType) {
    // Remove active class from all layout buttons
    layoutButtons.forEach(btn => btn.classList.remove('active'));
    
    // Update the data-layout attribute
    container.setAttribute('data-layout', layoutType);
    
    // Save the layout preference to localStorage
    localStorage.setItem('gl-code-layout', layoutType);
    
    // Reset the result panel width based on the layout
    if (layoutType === 'grid') {
        // For grid layout, remove inline width style
        resultPanel.style.cssText = '';
    } else if (layoutType === 'result-only') {
        // For result-only layout, set to 80%
        currentWidthPercentage = 80;
        applyResultWidth(currentWidthPercentage);
    } else {
        // For other layouts, apply the current width percentage
        applyResultWidth(currentWidthPercentage);
    }
    
    // Add active class to the clicked button
    let activeButton;
    switch(layoutType) {
        case 'horizontal':
            activeButton = layoutHorizontalBtn;
            break;
        case 'vertical':
            activeButton = layoutVerticalBtn;
            break;
        case 'grid':
            activeButton = layoutGridBtn;
            break;
        case 'result-only':
            activeButton = layoutResultOnlyBtn;
            break;
    }
    
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

// Initialize the editors with default code or localStorage values
window.addEventListener('load', function() {
    // Load saved code if it exists
    if (localStorage.getItem('codepen-html')) {
        htmlCode.value = localStorage.getItem('codepen-html');
        cssCode.value = localStorage.getItem('codepen-css');
        jsCode.value = localStorage.getItem('codepen-js');
    } else {
        // Set default values
        htmlCode.value = defaultHTML;
        cssCode.value = defaultCSS;
        jsCode.value = defaultJS;
    }
    
    // Load saved layout preference if it exists
    const savedLayout = localStorage.getItem('gl-code-layout');
    if (savedLayout) {
        switchLayout(savedLayout);
    }
    
    // Load saved width preference if it exists
    const savedWidth = localStorage.getItem('gl-code-result-width');
    if (savedWidth) {
        currentWidthPercentage = parseInt(savedWidth);
    }
    
    // Apply the width directly, not just on load
    if (container.getAttribute('data-layout') !== 'grid') {
        applyResultWidth(currentWidthPercentage);
    }
    
    // Run the code on initial load
    runCode();
    
    // Force immediate application of styles
    setTimeout(() => {
        if (container.getAttribute('data-layout') !== 'grid') {
            applyResultWidth(currentWidthPercentage);
        }
    }, 100);
});

// Add event listeners
runBtn.addEventListener('click', runCode);

saveBtn.addEventListener('click', function() {
    // Save the code to local storage
    localStorage.setItem('codepen-html', htmlCode.value);
    localStorage.setItem('codepen-css', cssCode.value);
    localStorage.setItem('codepen-js', jsCode.value);
    
    alert('Code saved successfully!');
});

// Clear button functionality
clearBtn.addEventListener('click', function() {
    const confirmed = confirm('هل أنت متأكد أنك تريد مسح كل الكود؟');
    
    if (confirmed) {
        resetToDefault();
        alert('تم مسح الكود بنجاح والعودة إلى القيم الافتراضية!');
    }
});

// Auto-run the code when editor loses focus
[htmlCode, cssCode, jsCode].forEach(editor => {
    editor.addEventListener('blur', runCode);
});

// Add keyboard shortcut: Ctrl+Enter to run code
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'Enter') {
        runCode();
    }
});

// Add event listeners for layout buttons
layoutHorizontalBtn.addEventListener('click', () => switchLayout('horizontal'));
layoutVerticalBtn.addEventListener('click', () => switchLayout('vertical'));
layoutGridBtn.addEventListener('click', () => switchLayout('grid'));
layoutResultOnlyBtn.addEventListener('click', () => switchLayout('result-only'));

// Add event listeners for resize buttons
resizeSmaller.addEventListener('click', () => resizeResultPanel('smaller'));
resizeLarger.addEventListener('click', () => resizeResultPanel('larger'));

// Add event listeners for direct percentage input
sizePercentageInput.addEventListener('change', handleDirectPercentageInput); // When pressing enter or losing focus
sizePercentageInput.addEventListener('blur', handleDirectPercentageInput); // When clicking elsewhere

// Prevent scrolling when focusing the input (optional UX improvement)
sizePercentageInput.addEventListener('focus', function(e) {
    e.preventDefault();
    this.select(); // Select all text for easy editing
});
