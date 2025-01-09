val2=document.getElementById("val2")
val3=document.getElementById("val3")

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
        return cal;  // Use Math.floor to convert to an integer
    }
}
num = [0,0,0,0]
green = [false, false, false, false]
wait= [0,0,0,0]
rem= [0,0,0,0]
time=0

while (true) {
    setInterval(() => {
        
        path="D:\IIIT Naya Raipur\Codes\Minor\corrected_detections.csv"

        data = fetch("")
        data = response.json();

        val2.innerText="Number of Vehicles: " + num[0]
        if(greeen[0]){
            val3.innerText="Remaining time: " + rem[0]
        }else{
            val3.innerText="Waiting time: " + wait[0]
        }
    }, 1000);
    time+=1
    
}