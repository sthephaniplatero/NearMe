export function calculateTravelTime(distance) {
  const walkSpeed = 5;   // km/h
  const carSpeed = 40;   // km/h

  const walkMinutes = Math.round((distance / walkSpeed) * 60);
  const carMinutes = Math.round((distance / carSpeed) * 60);

  return {
    walk: `${walkMinutes} min`,
    car: `${carMinutes} min`
  };
}