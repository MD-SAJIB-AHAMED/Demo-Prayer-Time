document.addEventListener("DOMContentLoaded", function () {
    const API_URL = "https://api.aladhan.com/v1/timingsByCity?city=Riyadh&country=Saudi Arabia&method=8";

    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            const timings = data.data.timings;
            const hijriDate = data.data.date.hijri.date;

            document.getElementById("fajr").textContent = formatTime(timings.Fajr);
            document.getElementById("dhuhr").textContent = formatTime(timings.Dhuhr);
            document.getElementById("asr").textContent = formatTime(timings.Asr);
            document.getElementById("maghrib").textContent = formatTime(timings.Maghrib);
            document.getElementById("isha").textContent = formatTime(timings.Isha);
            document.getElementById("hijriDate").textContent = `Hijri Date: ${hijriDate}`;

            updateNextPrayer(timings);
        })
        .catch(error => console.error("Error fetching prayer times:", error));
});

function formatTime(time) {
    const [hour, minute] = time.split(":");
    let formattedTime = new Date();
    formattedTime.setHours(hour, minute, 0);
    return formattedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

function updateNextPrayer(timings) {
    const now = new Date();
    const prayerTimes = {
        "Fajr": new Date(now.toDateString() + " " + timings.Fajr),
        "Dhuhr": new Date(now.toDateString() + " " + timings.Dhuhr),
        "Asr": new Date(now.toDateString() + " " + timings.Asr),
        "Maghrib": new Date(now.toDateString() + " " + timings.Maghrib),
        "Isha": new Date(now.toDateString() + " " + timings.Isha)
    };

    let nextPrayer = null;
    let minDiff = Infinity;

    for (const prayer in prayerTimes) {
        const diff = (prayerTimes[prayer] - now) / 1000;
        if (diff > 0 && diff < minDiff) {
            minDiff = diff;
            nextPrayer = prayer;
        }
    }

    if (nextPrayer) {
        document.getElementById("nextPrayer").textContent = `Next Prayer: ${nextPrayer} in ${formatCountdown(minDiff)}`;
        setTimeout(() => updateNextPrayer(timings), 1000);

        if (minDiff < 10) {
            showAzanNotification(nextPrayer);
        }
    }
}

function formatCountdown(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
}

function showAzanNotification(prayer) {
    if (Notification.permission === "granted") {
        new Notification("Azan Time!", {
            body: `It's time for ${prayer}!`,
            icon: "azan.png"
        });
        playAzanSound();
    } else {
        Notification.requestPermission();
    }
}

function playAzanSound() {
    const azanAudio = new Audio("azan.mp3");
    azanAudio.play();
}

document.getElementById("qiblaButton").addEventListener("click", function () {
    document.getElementById("qiblaContainer").style.display = "block";
    document.getElementById("qiblaMap").src = "https://maps.google.com/maps?q=Kaaba&t=&z=13&ie=UTF8&iwloc=&output=embed";
});