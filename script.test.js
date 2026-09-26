const fs = require('fs');
const path = require('path');

// Extract showToast function for testing
const scriptContent = fs.readFileSync(path.resolve(__dirname, 'script.js'), 'utf8');

// We need to extract the showToast function because it's inside a DOMContentLoaded listener
// Using a more forgiving regex to capture the function
const showToastMatch = scriptContent.match(/function showToast\([\s\S]*?2800\);\s*\}/);
let showToastFunctionStr = showToastMatch[0];

// Let eval create the function in the current scope
let toast;
eval(`
  ${showToastFunctionStr}
`);

describe('showToast', () => {
  let removeSpy, addSpy;

  beforeEach(() => {
    // Set up mock DOM element
    document.body.innerHTML = '<div id="toast"></div>';
    toast = document.getElementById('toast');

    // In jsdom, element.classList is a DOMTokenList. We can mock its methods.
    removeSpy = jest.spyOn(toast.classList, 'remove');
    addSpy = jest.spyOn(toast.classList, 'add');

    // Mock setTimeout
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('does nothing if toast element does not exist', () => {
    document.body.innerHTML = '';
    toast = null; // simulate not finding the element
    showToast('test message');
    // Shouldn't throw an error
  });

  it('updates textContent and styles for success message', () => {
    showToast('Success!', true);

    expect(toast.textContent).toBe('Success!');
    // jsdom might return colors in rgb format or just keep the hex based on implementation,
    // let's use a regex or check if it matches rgb/hex
    expect(toast.style.borderColor).toMatch(/rgb\(0, 245, 255\)|#00f5ff/i);
    expect(toast.style.color).toMatch(/rgb\(0, 245, 255\)|#00f5ff/i);
    expect(removeSpy).toHaveBeenCalledWith('opacity-0', 'translate-y-4');
    expect(addSpy).toHaveBeenCalledWith('opacity-100', 'translate-y-0');
  });

  it('updates textContent and styles for error message', () => {
    showToast('Error!', false);

    expect(toast.textContent).toBe('Error!');
    expect(toast.style.borderColor).toMatch(/rgb\(239, 68, 68\)|#ef4444/i);
    expect(toast.style.color).toMatch(/rgb\(239, 68, 68\)|#ef4444/i);
    expect(removeSpy).toHaveBeenCalledWith('opacity-0', 'translate-y-4');
    expect(addSpy).toHaveBeenCalledWith('opacity-100', 'translate-y-0');
  });

  it('defaults to success if isSuccess is not provided', () => {
    showToast('Default Success!');

    expect(toast.textContent).toBe('Default Success!');
    expect(toast.style.borderColor).toMatch(/rgb\(0, 245, 255\)|#00f5ff/i);
  });

  it('hides the toast after 2800ms', () => {
    showToast('Message');

    // Clear mock calls to check setTimeout actions
    addSpy.mockClear();
    removeSpy.mockClear();

    // Fast-forward time
    jest.advanceTimersByTime(2800);

    expect(addSpy).toHaveBeenCalledWith('opacity-0', 'translate-y-4');
    expect(removeSpy).toHaveBeenCalledWith('opacity-100', 'translate-y-0');
  });
});
