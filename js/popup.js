function goProfile() {
    const profileUrl = 'https://codeforces.com/profile/sapaul';
    chrome.tabs.create({ url: profileUrl });
}

document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('btn');
    btn.addEventListener('click', goProfile);
});




