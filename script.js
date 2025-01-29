document.addEventListener("DOMContentLoaded", function () {
const azanAudio = document.getElementById("azanAudio");

    function playAzan(prayer) {
        azanAudio.src = `audio/${prayer.toLowerCase()}.mp3`; // সঠিক নাম অনুসারে MP3 ফাইল লোড
        azanAudio.play();
    }

    function checkPrayerTime() {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        const prayerTimes = {
            "Fajr": document.getElementById("fajr").textContent.trim(),
            "Dhuhr": document.getElementById("dhuhr").textContent.trim(),
            "Asr": document.getElementById("asr").textContent.trim(),
            "Maghrib": document.getElementById("maghrib").textContent.trim(),
            "Isha": document.getElementById("isha").textContent.trim()
        };

        Object.keys(prayerTimes).forEach(prayer => {
            const [hour, minute] = prayerTimes[prayer].split(":").map(Number);
            if (currentHour === hour && currentMinute === minute) {
                playAzan(prayer);
            }
        });
    }

    setInterval(checkPrayerTime, 60000); // প্রতি মিনিটে চেক করবে

    const API_URL = "https://api.aladhan.com/v1/timingsByCity?city=Riyadh&country=Saudi Arabia&method=8";

    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            const timings = data.data.timings;
            const hijriDate = data.data.date.hijri.date;
            const gregorianDate = data.data.date.gregorian.date;

            document.getElementById("fajr").textContent = formatTime(timings.Fajr);
            document.getElementById("dhuhr").textContent = formatTime(timings.Dhuhr);
            document.getElementById("asr").textContent = formatTime(timings.Asr);
            document.getElementById("maghrib").textContent = formatTime(timings.Maghrib);
            document.getElementById("isha").textContent = formatTime(timings.Isha);
            document.getElementById("hijriDate").textContent = `Hijri Date: ${hijriDate}`;
            document.getElementById("gregorianDate").textContent = `Date: ${gregorianDate}`;

            updateNextPrayer(timings);
        })
        .catch(error => console.error("Error fetching prayer times:", error));

    getLocation();
});

function formatTime(time) {
    const [hour, minute] = time.split(":");
    let formattedTime = new Date();
    formattedTime.setHours(hour, minute, 0);
    return formattedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

function updateNextPrayer(timings) {
    // Next prayer countdown logic
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
                .then(response => response.json())
                .then(data => {
                    document.getElementById("location").textContent = `Location: ${data.address.city}, ${data.address.country}`;
                });
        });
    } else {
        document.getElementById("location").textContent = "Location not supported";
    }
}

document.getElementById("qiblaButton").addEventListener("click", function () {
    if (window.DeviceOrientationEvent) {
        document.getElementById("qiblaCompassContainer").style.display = "block";

        window.addEventListener("deviceorientation", function (event) {
            let compassDirection = event.alpha; // 0-360 degrees
            let qiblaDirection = 98; // Approximate Qibla direction for Riyadh

            let rotation = qiblaDirection - compassDirection;
            document.getElementById("compassImage").style.transform = `rotate(${rotation}deg)`;
            document.getElementById("qiblaDirection").textContent = `Qibla Direction: ${qiblaDirection}°`;
        });
    } else {
        alert("Compass not supported on this device!");
    }
});