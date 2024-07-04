document.addEventListener('DOMContentLoaded', function () {
    // Función para obtener los datos del repositorio desde GitHub API
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
                // Procesar los datos obtenidos
                updateRepoInfo(data);
                updateCommitActivity(data);
                updateLanguageChart(data);
            })
            .catch(error => {
                console.error('Error fetching repository data:', error);
                displayErrorMessage();
            });
    }

    // Función para actualizar la información del repositorio en la página
    function updateRepoInfo(data) {
        const commitCount = data?.size || 'Not available';
        const primaryLanguage = data?.language || 'Not specified';
        const languages = data?.languages_url;

        document.getElementById('commit-count').innerHTML = `<strong>Total Commits:</strong> ${commitCount}`;
        document.getElementById('primary-language').innerHTML = `<strong>Primary Language:</strong> ${primaryLanguage}`;

        if (languages) {
            fetch(languages)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Languages data not found');
                    }
                    return response.json();
                })
                .then(languagesData => {
                    updateLanguagesUsed(languagesData);
                })
                .catch(error => {
                    console.error('Error fetching languages data:', error);
                    document.getElementById('languages-used').innerHTML = '<li>Error fetching languages data</li>';
                });
        } else {
            document.getElementById('languages-used').innerHTML = '<li>Languages data not available</li>';
        }
    }

    // Función para actualizar el gráfico de actividad de commits
    function updateCommitActivity(data) {
        const commitsUrl = `${data?.url}/stats/commit_activity`;
        fetch(commitsUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Commit activity data not found');
                }
                return response.json();
            })
            .then(commitActivity => {
                const labels = commitActivity.map(item => {
                    const date = new Date(item.week * 1000); // Convertir timestamp a fecha
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                });
                const dataPoints = commitActivity.map(item => item.total);

                // Configurar el gráfico de actividad de commits utilizando Chart.js
                const ctx = document.getElementById('activityChart').getContext('2d');
                const activityChart = new Chart(ctx, {
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
                            pointRadius: 0,
                            pointHoverRadius: 7
                        }]
                    },
                    options: {
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
            })
            .catch(error => {
                console.error('Error fetching commit activity data:', error);
                // Mostrar mensaje de error en lugar del gráfico
                document.getElementById('activityChart').innerHTML = '<p>Error fetching commit activity data</p>';
            });
    }

    // Función para actualizar el gráfico de lenguajes utilizados
    function updateLanguageChart(data) {
        const languagesUrl = `${data?.url}/languages`;
        fetch(languagesUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Languages data not found');
                }
                return response.json();
            })
            .then(languagesData => {
                const labels = Object.keys(languagesData);
                const dataPoints = Object.values(languagesData);

                // Configurar el gráfico de lenguajes utilizados utilizando Chart.js
                const ctx = document.getElementById('languagesChart').getContext('2d');
                const languagesChart = new Chart(ctx, {
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

                // Mostrar porcentajes al lado del gráfico
                const languagesList = Object.keys(languagesData);
                const total = dataPoints.reduce((acc, curr) => acc + curr, 0);
                const percentages = languagesList.map(language => `${language}: ${(languagesData[language] / total * 100).toFixed(2)}%`);
                document.getElementById('languages-used').innerHTML = percentages.join('<br>');
            })
            .catch(error => {
                console.error('Error fetching languages data:', error);
                // Mostrar mensaje de error en lugar del gráfico
                document.getElementById('languagesChart').innerHTML = '<p>Error fetching languages data</p>';
            });
    }

    // Función para mostrar un mensaje de error en caso de falla en la obtención de datos
    function displayErrorMessage() {
        document.getElementById('commit-count').innerHTML = '<strong>Total Commits:</strong> Not available';
        document.getElementById('primary-language').innerHTML = '<strong>Primary Language:</strong> Not specified';
        document.getElementById('languages-used').innerHTML = '<li>Error fetching repository data</li>';
    }

    // Iniciar la carga de datos al cargar la página
    fetchRepoData();
});