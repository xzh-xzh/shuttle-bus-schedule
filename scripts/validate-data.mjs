import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SCHEDULE_DATA } from '../constants.ts';

const expectedDepartures = {
  weekday: [
    '07:30,07:30,07:40,09:30,09:30,10:00,10:20,10:30,11:00,11:10,11:20,11:40,11:55,12:10,12:20,12:40,12:50,13:05,13:20,13:40,14:00,14:20,14:30,14:40,15:00,15:20,15:30,15:40,16:00,16:20,16:30,16:50,17:10,17:10,17:20,17:40,17:50,18:00,18:20,18:30,18:40,18:40,18:50,19:10,19:30,19:45,20:05,20:25,20:25,20:45,21:05,21:25,21:45,22:05,22:15,22:25',
    '10:10,10:40,10:50,11:10,11:30,11:40,11:50,12:00,12:20,12:30,12:30,12:40,13:00,13:10,13:30,14:10,14:30,14:50,15:00,15:10,15:30,15:50,15:50,16:10,16:40,16:50,17:00,17:10,17:30,17:40,17:40,17:50,18:00,18:10,18:30,18:30,18:40,18:50,19:00,19:20,19:40,19:55,20:00,20:20,20:40,20:50,21:00,21:20,21:40,21:40,22:00,22:10,22:20,22:30'
  ],
  holiday: [
    '07:20,07:40,08:00,08:20,08:40,09:00,09:20,09:40,10:00,10:30,10:50,11:10,11:30,11:50,12:10,12:30,12:50,13:00,13:20,13:40,14:00,14:20,14:40,15:00,15:20,15:40,16:00,16:20,16:40,17:00,17:20,17:40,18:00,18:20,18:40,19:00,19:20,19:35,19:55,20:15,20:35,20:55,21:15,21:35,21:55,22:15,22:25',
    '07:30,07:50,08:10,08:30,08:50,09:10,09:30,09:50,10:10,10:40,11:00,11:20,11:40,12:00,12:20,12:40,12:55,13:10,13:30,13:50,14:10,14:30,14:50,15:10,15:30,15:50,16:10,16:30,16:50,17:10,17:30,17:50,18:10,18:30,18:50,19:10,19:30,19:50,20:10,20:30,20:50,21:10,21:30,21:50,22:10,22:20,22:30'
  ]
};

for (const scheduleType of ['weekday', 'holiday']) {
  assert.equal(SCHEDULE_DATA[scheduleType].length, 2, `${scheduleType} route count`);
  SCHEDULE_DATA[scheduleType].forEach((route, index) => {
    assert.equal(
      route.departures.map(departure => departure.time).join(','),
      expectedDepartures[scheduleType][index],
      `${scheduleType} ${route.name} departures`
    );
  });
}

assert.deepEqual(
  SCHEDULE_DATA.weekday.map(route =>
    route.loopingServices?.map(({ startTime, endTime }) => `${startTime}-${endTime}`)
  ),
  [['07:20-09:40'], ['07:30-09:50']]
);

const preset = JSON.parse(
  readFileSync(new URL('../data/holidays-2026-2027.json', import.meta.url), 'utf8')
);
assert.equal(preset.presetId, 'seu-2026-2027');
assert.equal(preset.rules.length, 7);

const coveredDates = new Map();
for (const rule of preset.rules) {
  const start = new Date(`${rule.startDate}T00:00:00Z`);
  const end = new Date(`${rule.endDate ?? rule.startDate}T00:00:00Z`);
  assert.ok(Number.isFinite(start.valueOf()) && Number.isFinite(end.valueOf()) && end >= start);
  for (const cursor = new Date(start); cursor <= end; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    const date = cursor.toISOString().slice(0, 10);
    assert.ok(!coveredDates.has(date), `duplicate preset date ${date}`);
    coveredDates.set(date, rule.type);
  }
}

assert.equal(coveredDates.size, 92);
assert.equal(coveredDates.get('2026-09-20'), 'workday');
assert.equal(coveredDates.get('2026-09-25'), 'holiday');
assert.equal(coveredDates.get('2026-10-10'), 'workday');
assert.equal(coveredDates.get('2027-02-21'), 'holiday');
assert.equal(coveredDates.get('2027-06-27'), undefined);
assert.equal(coveredDates.get('2027-06-28'), 'holiday');

console.log('Schedule and academic-calendar preset validation passed.');
