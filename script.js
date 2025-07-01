document.addEventListener('DOMContentLoaded', function () {
    function fetchRepoData() {
        const apiUrl = 'https://api.github.com/repos/TDD788/A12s-DevTree';
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                updateRepoInfo(data);
                fetchCommitActivity(data.url);
                fetchLanguages(data.languages_url);
            })
            .catch(error => {
                console.error('Error fetching repository data:', error);
                displayErrorMessage();
            });
    }

    function updateRepoInfo(data) {
        const commitCount = data?.size || 'Not available';
        const primaryLanguage = data?.language || 'Not specified';

        document.getElementById('commit-count').textContent = `Total Commits: ${commitCount}`;
        document.getElementById('primary-language').textContent = `Primary Language: ${primaryLanguage}`;
    }

    function fetchCommitActivity(repoUrl) {
        const commitsUrl = `${repoUrl}/stats/commit_activity`;
        fetch(commitsUrl)
            .then(response => {
                if (response.status === 202) {
                    // GitHub is calculating the data, retry after delay
                    return new Promise(resolve => setTimeout(resolve, 2000))
                        .then(() => fetch(commitsUrl));
                }
                if (!response.ok) {
                    throw new Error('Commit activity data not found');
                }
                return response.json();
            })
            .then(commitActivity => {
                if (!commitActivity || typeof commitActivity !== 'object') {
                    throw new Error('Invalid commit activity data');
                }
                
                if (Object.keys(commitActivity).length === 0) {
                    document.getElementById('activityChart').innerHTML = 
                        '<p>Commit data not available yet. Try refreshing later.</p>';
                    return;
                }
                
                if (Array.isArray(commitActivity)) {
                    renderCommitChart(commitActivity);
                } else {
                    throw new Error('Commit activity data is not in expected format');
                }
            })
            .catch(error => {
                console.error('Error fetching commit activity data:', error);
                document.getElementById('activityChart').innerHTML = 
                    `<p>Error: ${error.message}</p>`;
            });
    }

    function renderCommitChart(commitActivity) {
        const labels = commitActivity.map((item, index) => {
            if (!item.week) {
                return `Week ${index + 1}`;
            }
            const date = new Date(item.week * 1000);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        
        const dataPoints = commitActivity.map(item => item.total || 0);

        const ctx = document.getElementById('activityChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Commit Activity',
                    data: dataPoints,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(75, 192, 192, 1)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 1,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: {
                            color: 'rgba(255, 255, 255, 0.8)'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.8)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.8)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    }

    function fetchLanguages(languagesUrl) {
        if (!languagesUrl) {
            document.getElementById('languages-used').innerHTML = '<li>Languages data not available</li>';
            return;
        }

        fetch(languagesUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Languages data not found');
                }
                return response.json();
            })
            .then(languagesData => {
                if (Object.keys(languagesData).length === 0) {
                    document.getElementById('languages-used').innerHTML = '<li>No language data available</li>';
                    return;
                }
                renderLanguageChart(languagesData);
                updateLanguagesList(languagesData);
            })
            .catch(error => {
                console.error('Error fetching languages data:', error);
                document.getElementById('languages-used').innerHTML = '<li>Error fetching languages data</li>';
                document.getElementById('languagesChart').innerHTML = '<p>Error fetching languages data</p>';
            });
    }

    function renderLanguageChart(languagesData) {
        const labels = Object.keys(languagesData);
        const dataPoints = Object.values(languagesData);

        const ctx = document.getElementById('languagesChart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Languages Used',
                    data: dataPoints,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)',
                        'rgba(255, 159, 64, 0.7)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: 'rgba(255, 255, 255, 0.8)'
                        }
                    }
                }
            }
        });
    }

    function updateLanguagesList(languagesData) {
        const languagesList = Object.keys(languagesData);
        const total = Object.values(languagesData).reduce((acc, curr) => acc + curr, 0);
        
        if (total === 0) {
            document.getElementById('languages-used').innerHTML = '<li>No language data available</li>';
            return;
        }

        const percentages = languagesList.map(language => {
            return `<li>${language}: ${(languagesData[language] / total * 100).toFixed(2)}%</li>`;
        });
        document.getElementById('languages-used').innerHTML = percentages.join('');
    }

    function displayErrorMessage() {
        document.getElementById('commit-count').textContent = 'Total Commits: Not available';
        document.getElementById('primary-language').textContent = 'Primary Language: Not specified';
        document.getElementById('languages-used').innerHTML = '<li>Error fetching repository data</li>';
    }

    fetchRepoData();
});
