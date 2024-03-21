import crypto from "crypto";
import pgp from "pg-promise";

export function validateCpf(cpf: string) {
  if (!cpf) return false;
  cpf = clean(cpf);
  if (isInvalidLength(cpf)) return false;
  if (allDigitsAreTheSame(cpf)) return false;
  const dg1 = calculateDigit(cpf, 10);
  const dg2 = calculateDigit(cpf, 11);
  return extractCheckDigit(cpf) === `${dg1}${dg2}`;
}

function clean(cpf: string) {
  return cpf.replace(/\D/g, "");
}

function isInvalidLength(cpf: string) {
  return cpf.length !== 11;
}

function allDigitsAreTheSame(cpf: string) {
  return cpf.split("").every((c) => c === cpf[0]);
}

function calculateDigit(cpf: string, factor: number) {
  let total = 0;
  for (const digit of cpf) {
    if (factor > 1) total += parseInt(digit) * factor--;
  }
  const rest = total % 11;
  return rest < 2 ? 0 : 11 - rest;
}

function extractCheckDigit(cpf: string) {
  return cpf.slice(9);
}

export async function signup(input: any): Promise<any> {
  const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
  try {
    const accountId = crypto.randomUUID();
    const [account] = await connection.query(
      "select * from cccat14.account where email = $1",
      [input.email],
    );
    if (account) throw new Error("Duplicated account");
    if (isInvalidName(input.name)) throw new Error("Invalid name");
    if (isInvalidEmail(input.email)) throw new Error("Invalid email");
    if (!validateCpf(input.cpf)) throw new Error("Invalid cpf");
    if (input.isDriver && isInvalidCarPlate(input.carPlate))
      throw new Error("Invalid car plate");
    await connection.query(
      "insert into cccat14.account (account_id, name, email, cpf, car_plate, is_passenger, is_driver) values ($1, $2, $3, $4, $5, $6, $7)",
      [
        accountId,
        input.name,
        input.email,
        input.cpf,
        input.carPlate,
        !!input.isPassenger,
        !!input.isDriver,
      ],
    );
    return {
      accountId,
    };
  } finally {
    await connection.$pool.end();
  }
}

function isInvalidName(name: string) {
  return !name.match(/[a-zA-Z] [a-zA-Z]+/);
}

function isInvalidEmail(email: string) {
  return !email.match(/^(.+)@(.+)$/);
}

function isInvalidCarPlate(carPlate: string) {
  return !carPlate.match(/[A-Z]{3}[0-9]{4}/);
}

export async function getAccount(accountId: string) {
  const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
  const [account] = await connection.query(
    "select * from cccat14.account where account_id = $1",
    [accountId],
  );
  await connection.$pool.end();
  return account;
}

export async function requestRide(
  passenger_id: string,
  userLatitude: number,
  userLongitude: number,
  destinationLongitude: number,
  destinationLatitude: number,
) {
  const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
  try {
    const ride_id = crypto.randomUUID();
    const rideRequest = await connection.query(
      "select * from cccat14.ride where passenger_id = $1",
      passenger_id,
    );
    if (!passenger_id) throw new Error("account doesnt exist");
    await connection.query(
      "INSERT INTO cccat14.ride (ride_id, passenger_id, status, from_lat, from_long, to_lat, to_long, date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
      [
        ride_id, // Substitua pelas variáveis apropriadas que você definiu em seu código
        passenger_id,
        "requested",
        userLatitude, // Substitua pelas variáveis apropriadas que você definiu em seu código
        userLongitude,
        destinationLatitude, // Substitua pelas variáveis apropriadas que você definiu em seu código
        destinationLongitude,
        new Date(),
      ],
    );
    {
      return rideRequest;
    }
  } finally {
    await connection.$pool.end();
  }
}
