chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({
        url: 'index.html'
    });
});

console.log('Stream Layout Extension active');
