// Function to fetch and parse CSV based on the given path and frame number
const getFromCsv = (path, framenum) => {
    return fetch(path)  // Fetch the CSV from the provided path
        .then(response => response.text())  // Get the text content of the response (CSV data)
        .then(csvText => {
            return new Promise((resolve, reject) => {
                // Parse the CSV text using PapaParse
                Papa.parse(csvText, {
                    complete: function (results) {
                        const data = results.data;
                        const targetFrame = framenum;
                        let sum = 0;

                        // Loop through the rows to find the target frame
                        for (let row of data) {
                            if (row.frame) {
                                const frameValue = parseInt(row.frame.trim(), 10);
                                if (frameValue === targetFrame) {
                                    // Parse vehicle counts and calculate the sum
                                    const carCount = parseInt(row.car_count) || 0;
                                    const motorcycleCount = parseInt(row.motorcycle_count) || 0;
                                    const truckCount = parseInt(row.truck_count) || 0;
                                    const Emergency = parseInt(row.ambulance_count) || 0;

                                    sum = carCount + motorcycleCount + truckCount;
                                    resolve({ carCount, motorcycleCount, truckCount, Emergency, sum });
                                    return;
                                }
                            }
                        }

                        // If no matching frame found, resolve with default values
                        resolve({ carCount: 0, motorcycleCount: 0, truckCount: 0, Emergency: 0, sum: 0 });
                        return;
                    },
                    header: true,
                    skipEmptyLines: true,
                    error: (error) => reject(error),
                });
            });
        });
};

function timeCalc(car, bike, truck) {
    const factor = 3.0;
    const min = 1;
    const max = 15;

    // Calculate the value using the formula
    const cal = car * 0.2 * factor + bike * 0.1 * factor + truck * 0.3 * factor;

    // Return the appropriate value based on the calculation
    if (cal <= min) {
        return min;
    } else if (cal > max) {
        return max;
    } else {
        return Math.floor(cal);
    }
}

const mainLoop = async () => {
    let curr_time = 0
    let Total = 0, Total_left = 0
    let path1 = 'corrected_detections.csv', path2 = 'help1.csv', path3 = 'help2.csv', path4 = 'help3.csv'
    let alloted_time = [0, 0, 0, 0], fps = 30, green = -1
    let vehicle_count = [0, 0, 0, 0], run_time = [0, 0, 0, 0]
    let op=1, op2=0

    let web_disp = [], cnt_disp = [], outer=document.getElementById('out');
    web_disp.push(document.getElementById('val14'));
    web_disp.push(document.getElementById('val24'));
    web_disp.push(document.getElementById('val34'));
    web_disp.push(document.getElementById('val44'));

    cnt_disp.push(document.getElementById('val12'));
    cnt_disp.push(document.getElementById('val22'));
    cnt_disp.push(document.getElementById('val32'));
    cnt_disp.push(document.getElementById('val42'));


    let lights = []
    for (let i = 1; i <= 4; i++) {
        let temp = []
        temp.push(document.getElementById('red' + String(i)));
        temp.push(document.getElementById('yellow' + String(i)));
        temp.push(document.getElementById('green' + String(i)));
        lights.push(temp)
    }

    function light_controller(leg, num, state) {
        if (state === 0) {
            lights[leg][num].style.backgroundColor = "#636363";
            // lights[leg][num].style.boxShadow = "0 8px 15px rgba(0, 0, 0, 0.8), inset 0 0 10px rgba(0, 0, 0, 0.8)";
        } else {
            let color, color2
            if (num === 0) color = "#e60000", color2 = "rgba(190, 155, 0"
            else if (num === 1) color = "#fff700", color2 = "rgba(190, 155, 0, 0.8)"
            else color = "#00c41d", color2 = "rgba(43, 255, 0)"

            lights[leg][num].style.backgroundColor = color;
            // lights[leg][num].style.boxShadow = "0 8px 20px " + color2 + ", inset 0 0 5px rgba(0, 0, 0, 0.8)";
        }
    }


    while (curr_time < 200){
        if(Total_left < 10 && op==1 && op2){
            // Emergency Trigger
            op=0;
            light_controller(3,0,0);
            light_controller(0,1,0);
            light_controller(1,1,0);
            light_controller(2,1,0);
            light_controller(3,1,0);
            light_controller(0,2,0);
            light_controller(1,2,0);
            light_controller(2,2,0);
            light_controller(3,2,1);

            for (let i = 0; i < 4; i++){
                web_disp[i].innerText = "Waiting Time: " + 'SOS'
            }

            document.getElementById('hehe').innerText="True"
            document.getElementById('hehe').style.color="#00650f"
            const blink = document.getElementById('Emer')

            for(let i=0; i<30; i++){
                if(i&1){
                    console.log(i);
                    light_controller(0,0,0);
                    light_controller(1,0,0);
                    light_controller(2,0,0);
                    outer.style.background='#233385';
                    blink.style.backgroundColor="#233385";
                }else{
                    console.log(i);
                    light_controller(0,0,1);
                    light_controller(1,0,1);
                    light_controller(2,0,1);
                    outer.style.background='#d71a1a';
                    blink.style.backgroundColor="#d71a1a";
                }
                await new Promise(resolve => setTimeout(resolve, 400));
                curr_time-=0.4
            }

            Total=0, Total_left=0
            continue;
        }else if (Total_left <= 1) {
            const [val1, val2, val3, val4] = await Promise.all([
                getFromCsv(path1, Math.floor(curr_time / fps)),
                getFromCsv(path2, Math.floor(curr_time / fps)),
                getFromCsv(path3, Math.floor(curr_time / fps)),
                getFromCsv(path4, Math.floor(curr_time / fps)),
            ]);

            alloted_time[0] = timeCalc(val1.carCount, val1.motorcycleCount, val1.truckCount);
            alloted_time[1] = timeCalc(val2.carCount, val2.motorcycleCount, val2.truckCount);
            alloted_time[2] = timeCalc(val3.carCount, val3.motorcycleCount, val3.truckCount);
            alloted_time[3] = timeCalc(val4.carCount, val4.motorcycleCount, val4.truckCount);

            vehicle_count[0] = val1.sum
            vehicle_count[1] = val2.sum
            vehicle_count[2] = val3.sum
            vehicle_count[3] = val4.sum

            for (let i = 1; i < 4; i++) run_time[i] += alloted_time[i - 1] + run_time[i - 1], Total+=alloted_time[i];
            run_time[0] = alloted_time[0]
            
            Total+=alloted_time[0]
            Total_left = Total, green = 0;

            light_controller(3, 2, 0);
            await new Promise(resolve => setTimeout(resolve, 200));
            light_controller(3, 0, 1);

            light_controller(0, 0, 0);
            await new Promise(resolve => setTimeout(resolve, 200));
            light_controller(0, 1, 1);
            await new Promise(resolve => setTimeout(resolve, 500));
            light_controller(0, 1, 0);
            await new Promise(resolve => setTimeout(resolve, 200));
            light_controller(0, 2, 1);
        } else {
            if (run_time[green] === 0) {
                run_time[green] = Total_left
                run_time[green + 1] = alloted_time[green + 1]

                light_controller(green, 2, 0);
                await new Promise(resolve => setTimeout(resolve, 200));
                light_controller(green, 0, 1);

                green++
                light_controller(green, 0, 0);
                await new Promise(resolve => setTimeout(resolve, 200));
                light_controller(green, 1, 1);
                await new Promise(resolve => setTimeout(resolve, 500));
                light_controller(green, 1, 0);
                await new Promise(resolve => setTimeout(resolve, 200));
                light_controller(green, 2, 1);
            }
        }
        op2=1

        await new Promise(resolve => setTimeout(resolve, 1000));
        curr_time++, Total_left--;
        for (let i = 0; i < 4; i++) {
            cnt_disp[i].innerText = "Number of vehicles: " + vehicle_count[i]
            if (i === green){
                if(vehicle_count[green]>0 && vehicle_count[green]<5) vehicle_count[green]--;
                else if(vehicle_count[green]>3) vehicle_count[green]-=2;

                run_time[i]--;
                web_disp[i].innerText = "Remaining Time: " + run_time[i]
                continue
            }
            run_time[i]--;
            web_disp[i].innerText = "Waiting Time: " + run_time[i]
        }
    }
};


mainLoop().catch(error => console.error('Error in main loop:', error));