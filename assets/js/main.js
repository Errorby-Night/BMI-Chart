window.addEventListener('DOMContentLoaded', () => {
    const csvURL = 'https://docs.google.com/spreadsheets/d/1J2y6mLJosZxHtmALugsQojDs9ZGfXe9ln47cggqHLDg/export?format=csv';
    const themeButton = document.getElementById('theme');
    let isDarkMode = false;

    function applyTheme() {
        if (isDarkMode) {
            document.body.style.backgroundColor = '#333'; // Dark background
            document.body.style.color = '#f8f8f8'; // Light text
            document.getElementById('header').style.backgroundColor = 'rgba(255, 255, 255,  0.5)';
            document.getElementById('heading').style.color = 'white';
            themeButton.querySelector('img').src = 'https://img.icons8.com/external-glyph-silhouettes-icons-papa-vector/50/external-Light-Mode-interface-glyph-silhouettes-icons-papa-vector.png'; // Dark mode icon
        } else {
            document.body.style.backgroundColor = '#f8f8f8'; // Light background
            document.body.style.color = '#333'; // Dark text
            document.getElementById('header').style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            document.getElementById('heading').style.color = 'black';
            themeButton.querySelector('img').src = "https://img.icons8.com/ios-filled/30/do-not-disturb-2.png"; // Light mode icon
        }
    }

    themeButton.addEventListener('click', () => {
        isDarkMode = !isDarkMode; // Toggle mode
        applyTheme(); // Apply the theme
    });

    function csvtoJson(csv) {
        const lines = csv.split("\n");
        const headers = lines[0].split(',');    

        return lines.slice(1).map(row => {
            const values = row.split(',');
            const jsonObj = {};

            headers.forEach((h, i) => {
                jsonObj[h.trim()] = values[i].trim();  // Corrected assignment
            });

            return jsonObj;
        });
    }

    function calculateBMI(weight) {
        return Number(weight / (1.74 * 1.74)).toFixed(2);
    }

    async function fetchFile() {
        try {
            const response = await fetch(csvURL);
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }

            // Read the CSV data as text
            const csvText = await response.text();

            const jsonObj = csvtoJson(csvText);
            const labels = [];
            const weights = [];
            const bmis = [];

            // Calculate BMI for each entry
            jsonObj.forEach(entry => {
                // Assuming the weight column is named "Weight"
                if (entry.Weight) {
                    const weight = parseFloat(entry.Weight);
                    const date = new Date(entry.Date);
                    if (!isNaN(weight)) {
                        const bmi = calculateBMI(weight);
                        entry.BMI = bmi; // Add the BMI value to the entry
                        
                        // Push the values to arrays for plotting
                        labels.push(date.toLocaleDateString()); // Assuming there's a Name field for the X-axis labels
                        weights.push(weight);
                        bmis.push(bmi);
                        console.log(bmi)
                    }
                }
            });

            // Log the updated JSON data with BMI
            // console.log(jsonObj);
            const ctx = document.getElementById('weightBmiChart').getContext('2d');
            const weightBmiChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Weight (kg)',
                            data: weights,
                            borderColor: 'blue',
                            // backgroundColor: 'rgba(0, 0, 255, 0.2)',
                            fill: false,
                        },
                        {
                            label: 'BMI',
                            data: bmis,
                            borderColor: 'red',
                            // backgroundColor: 'rgba(255, 0, 0, 0.2)',
                            fill: false,
                        }
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Value'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Date'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: true,
                        },
                    },
                }
            });
        }
        catch (error) {
            console.error('Failed to fetch CSV file:', error);
        }
    }

    fetchFile();
});
