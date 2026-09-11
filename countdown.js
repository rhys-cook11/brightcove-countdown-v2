(function () {
  'use strict';

  videojs.registerPlugin('countdownClock', function (options) {
    var player = this;

    var settings = Object.assign({
      title: 'CEPS ARIA AWARDS STARTS IN',
      target: '2026-10-21T08:30:00+11:00',
      finishedMessage: 'THE CEPS ARIA AWARDS HAVE STARTED!',
      showSeconds: true
    }, options || {});

    if (!settings.target) {
      console.error('countdownClock: No target date/time supplied.');
      return;
    }

    var targetTime = new Date(settings.target).getTime();

    if (isNaN(targetTime)) {
      console.error('countdownClock: Invalid target date/time:', settings.target);
      return;
    }

    player.addClass('countdown-player');

    var overlay = document.createElement('div');
    overlay.className = 'countdown-overlay';
    overlay.setAttribute('role', 'timer');
    overlay.setAttribute('aria-live', 'off');

    var title = document.createElement('div');
    title.className = 'countdown-title';
    title.textContent = settings.title;

    var timer = document.createElement('div');
    timer.className = 'countdown-timer';

    var units = [
      { key: 'days', label: 'DAYS' },
      { key: 'hours', label: 'HOURS' },
      { key: 'minutes', label: 'MINUTES' }
    ];

    if (settings.showSeconds !== false) {
      units.push({ key: 'seconds', label: 'SECONDS' });
    }

    var valueElements = {};

    units.forEach(function (unit) {
      var unitWrap = document.createElement('div');
      unitWrap.className = 'countdown-unit';

      var value = document.createElement('div');
      value.className = 'countdown-value countdown-' + unit.key;
      value.textContent = '00';

      var label = document.createElement('div');
      label.className = 'countdown-label';
      label.textContent = unit.label;

      valueElements[unit.key] = value;

      unitWrap.appendChild(value);
      unitWrap.appendChild(label);
      timer.appendChild(unitWrap);
    });

    var finished = document.createElement('div');
    finished.className = 'countdown-finished';
    finished.textContent = settings.finishedMessage;
    finished.hidden = true;

    overlay.appendChild(title);
    overlay.appendChild(timer);
    overlay.appendChild(finished);

    player.el().appendChild(overlay);

    function pad(value) {
      return String(value).padStart(2, '0');
    }

    function updateCountdown() {
      var now = Date.now();
      var remaining = targetTime - now;

      if (remaining <= 0) {
        timer.hidden = true;
        title.hidden = true;
        finished.hidden = false;
        overlay.setAttribute('aria-live', 'polite');

        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        return;
      }

      var totalSeconds = Math.floor(remaining / 1000);
      var days = Math.floor(totalSeconds / 86400);
      var hours = Math.floor((totalSeconds % 86400) / 3600);
      var minutes = Math.floor((totalSeconds % 3600) / 60);
      var seconds = totalSeconds % 60;

      valueElements.days.textContent = pad(days);
      valueElements.hours.textContent = pad(hours);
      valueElements.minutes.textContent = pad(minutes);

      if (valueElements.seconds) {
        valueElements.seconds.textContent = pad(seconds);
      }
    }

    var intervalId = null;

    updateCountdown();
    intervalId = window.setInterval(updateCountdown, 1000);

    player.on('dispose', function () {
      if (intervalId) {
        clearInterval(intervalId);
      }
    });
  });
}());
