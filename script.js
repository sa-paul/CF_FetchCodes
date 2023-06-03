// Fetch codes from user's friends on Codeforces
async function fetchFriendsCodes() {
    const friends = await fetchFriends();
    const problemId = getProblemIdFromUrl();
  
    const fetchCodesPromises = friends.map(handle => {
      const userUrl = `https://codeforces.com/api/user.status?handle=${handle}&from=1&count=10000`;
      return fetch(userUrl).then(response => response.json());
    });
  
    const responses = await Promise.all(fetchCodesPromises);
  
    const acceptedCodes = [];
    for (const response of responses) {
      const userAcceptedCodes = response.result.filter(code => {
        return code.problem.contestId === parseInt(problemId) && code.verdict === 'OK';
      });
  
      for (const code of userAcceptedCodes) {
        acceptedCodes.push(code.sourceCode);
      }
    }
  
    return acceptedCodes;
  }
  
  // Fetch user's friends from Codeforces API
  async function fetchFriends() {
    const friendsUrl = 'https://codeforces.com/api/user.friends?onlyOnline=true';
    const response = await fetch(friendsUrl);
    const data = await response.json();
    return data.result.map(friend => friend.handle);
  }
  
  // Extract problem ID from the current URL
  function getProblemIdFromUrl() {
    const url = new URL(window.location.href);
    const path = url.pathname.split('/');
    const problemId = path[path.length - 1];
    return problemId;
  }
  
  // Render the codes in the HTML page
  function renderCodes(codes) {
    const codesContainer = document.getElementById('codes-container');
    codesContainer.innerHTML = '';
  
    if (codes.length === 0) {
      codesContainer.textContent = 'No codes found from friends.';
      return;
    }
  
    const codeList = document.createElement('ul');
    codes.forEach(code => {
      const codeItem = document.createElement('li');
      const codeText = document.createElement('pre');
      codeText.textContent = code;
      codeItem.appendChild(codeText);
      codeList.appendChild(codeItem);
    });
  
    codesContainer.appendChild(codeList);
  }
  
  // Fetch codes and render them when the button is clicked
  const fetchCodesBtn = document.getElementById('fetch-codes-btn');
  fetchCodesBtn.addEventListener('click', async () => {
    const codes = await fetchFriendsCodes();
    renderCodes(codes);
  });
  