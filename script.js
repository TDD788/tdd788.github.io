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

        document.getElementById('commit-count').innerHTML = `<strong>Total Commits:</strong> ${commitCount}`;
        document.getElementById('primary-language').innerHTML = `<strong>Primary Language:</strong> ${primaryLanguage}`;
    }

    function fetchCommitActivity(repoUrl) {
        const commitsUrl = `${repoUrl}/stats/commit_activity`;
        fetch(commitsUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Commit activity data not found');
                }
                return response.json();
            })
            .then(commitActivity => {
                if (!Array.isArray(commitActivity)) {
                    throw new Error('Commit activity data is not in expected format');
                }
                renderCommitChart(commitActivity);
            })
            .catch(error => {
                console.error('Error fetching commit activity data:', error);
                document.getElementById('activityChart').innerHTML = '<p>Error fetching commit activity data</p>';
            });
    }

    function renderCommitChart(commitActivity) {
        const labels = commitActivity.map(item => {
            const date = new Date(item.week * 1000);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        const dataPoints = commitActivity.map(item => item.total);

        const ctx = document.getElementById('activityChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Commit Activity',
                    data: dataPoints,
                    borderColor: 'rgba(255, 255, 255, 1)',
                    backgroundColor: 'rgba(255, 255, 255, 0)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(0, 0, 0, 1)',
                    pointBorderWidth: 2,
                    pointRadius: 2,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.8)'
                        }
                    },
                    x: {
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.8)'
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
                    backgroundColor: ['#ffffff', '#cccccc', '#888888', '#aaaaaa', '#dddddd', '#bbbbbb'],
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
        const percentages = languagesList.map(language => {
            return `${language}: ${(languagesData[language] / total * 100).toFixed(2)}%`;
        });
        document.getElementById('languages-used').innerHTML = percentages.join('<br>');
    }

    function displayErrorMessage() {
        document.getElementById('commit-count').innerHTML = '<strong>Total Commits:</strong> Not available';
        document.getElementById('primary-language').innerHTML = '<strong>Primary Language:</strong> Not specified';
        document.getElementById('languages-used').innerHTML = '<li>Error fetching repository data</li>';
    }

    fetchRepoData();
});
