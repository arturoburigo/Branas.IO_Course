import { getAccount, getRide, requestRide, signup } from "../src/main";

test.each(["97456321558", "71428793860", "87748248800"])(
  "Deve criar uma conta para o passageiro",
  async function (cpf: string) {
    // given
    const inputSignup = {
      name: "John Doe",
      email: `john.doe${Math.random()}@gmail.com`,
      cpf,
      isPassenger: true,
      password: "123456",
    };
    // when
    const outputSignup = await signup(inputSignup);
    const outputGetAccount = await getAccount(outputSignup.accountId);
    // then
    expect(outputSignup.accountId).toBeDefined();
    expect(outputGetAccount.name).toBe(inputSignup.name);
    expect(outputGetAccount.email).toBe(inputSignup.email);
  },
);

test("Não deve criar uma conta se o nome for inválido", async function () {
  // given
  const inputSignup = {
    name: "John",
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: "97456321558",
    isPassenger: true,
    password: "123456",
  };
  // when
  await expect(() => signup(inputSignup)).rejects.toThrow(
    new Error("Invalid name"),
  );
});

test("Não deve criar uma conta se o email for inválido", async function () {
  // given
  const inputSignup = {
    name: "John Doe",
    email: `john.doe${Math.random()}`,
    cpf: "97456321558",
    isPassenger: true,
    password: "123456",
  };
  // when
  await expect(() => signup(inputSignup)).rejects.toThrow(
    new Error("Invalid email"),
  );
});

test.each(["", undefined, null, "11111111111", "111", "11111111111111"])(
  "Não deve criar uma conta se o cpf for inválido",
  async function (cpf: any) {
    // given
    const inputSignup = {
      name: "John Doe",
      email: `john.doe${Math.random()}@gmail.com`,
      cpf,
      isPassenger: true,
      password: "123456",
    };
    // when
    await expect(() => signup(inputSignup)).rejects.toThrow(
      new Error("Invalid cpf"),
    );
  },
);

test("Não deve criar uma conta se o email for duplicado", async function () {
  // given
  const inputSignup = {
    name: "John Doe",
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: "97456321558",
    isPassenger: true,
    password: "123456",
  };
  // when
  await signup(inputSignup);
  await expect(() => signup(inputSignup)).rejects.toThrow(
    new Error("Duplicated account"),
  );
});

test("Deve criar uma conta para o motorista", async function () {
  // given
  const inputSignup = {
    name: "John Doe",
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: "97456321558",
    carPlate: "AAA9999",
    isPassenger: false,
    isDriver: true,
    password: "123456",
  };
  // when
  const outputSignup = await signup(inputSignup);
  const outputGetAccount = await getAccount(outputSignup.accountId);
  // then
  expect(outputSignup.accountId).toBeDefined();
  expect(outputGetAccount.name).toBe(inputSignup.name);
  expect(outputGetAccount.email).toBe(inputSignup.email);
});

test("Não deve criar uma conta para o motorista com a placa inválida", async function () {
  // given
  const inputSignup = {
    name: "John Doe",
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: "97456321558",
    carPlate: "AAA999",
    isPassenger: false,
    isDriver: true,
    password: "123456",
  };
  // when
  await expect(() => signup(inputSignup)).rejects.toThrow(
    new Error("Invalid car plate"),
  );
});

test("should be able to create a ride request", async () => {
  const account = await signup({
    name: "John Doe",
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: "02155167024",
    isPassenger: true,
    password: "123456",
  });

  const rideRequest = await requestRide({
    account_id: account.accountId,
    destinationLatitude: 34.052235, // Latitude de Los Angeles
    destinationLongitude: -118.243683, // Longitude de Los Angeles
    userLatitude: 40.712776, // Latitude de Nova York (origem)
    userLongitude: -74.005974, // Longitude de Nova York (origem)
  });

  expect(rideRequest).toBeDefined();
});

test("Should not be able to request a ride if you're not a passenger", async () => {
  const account = await signup({
    name: "John Doe",
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: "02155167024",
    isPassenger: false,
    password: "123456",
  });
  await expect(async () => {
    await requestRide({
      account_id: account.accountId,
      destinationLatitude: 34.052235, // Latitude de Los Angeles
      destinationLongitude: -118.243683, // Longitude de Los Angeles
      userLatitude: 40.712776, // Latitude de Nova York (origem)
      userLongitude: -74.005974, // Longitude de Nova York (origem)
    });
  }).rejects.toThrow("Account isn't a passenger");
});

test("Should not be able to request a ride if accountId doesnt exist", async () => {
  await expect(async () => {
    await requestRide({
      account_id: "580bccfc-e4d1-45e7-91ff-c4f65b836969",
      destinationLatitude: 34.052235, // Latitude de Los Angeles
      destinationLongitude: -118.243683, // Longitude de Los Angeles
      userLatitude: 40.712776, // Latitude de Nova York (origem)
      userLongitude: -74.005974, // Longitude de Nova York (origem)
    });
  }).rejects.toThrow("Account doesn't exist");
});

test("Should not be able to request a ride if you have an ongoing one", async () => {
  const account = await signup({
    name: "John Doe",
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: "02155167024",
    isPassenger: true,
    password: "123456",
  });
  await requestRide({
    account_id: account.accountId,
    destinationLatitude: 34.052235, // Latitude de Los Angeles
    destinationLongitude: -118.243683, // Longitude de Los Angeles
    userLatitude: 40.712776, // Latitude de Nova York (origem)
    userLongitude: -74.005974, // Longitude de Nova York (origem)
  });
  await expect(async () => {
    await requestRide({
      account_id: account.accountId,
      destinationLatitude: 34.052235, // Latitude de Los Angeles
      destinationLongitude: -118.243683, // Longitude de Los Angeles
      userLatitude: 40.712776, // Latitude de Nova York (origem)
      userLongitude: -74.005974, // Longitude de Nova York (origem)
    });
  }).rejects.toThrow("Passenger already has an ongoing ride");
});

test("Should be able to get ride information", async () => {
  const account = await signup({
    name: "John Doe",
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: "02155167024",
    isPassenger: true,
    password: "123456",
  });
  const rideId = await requestRide({
    account_id: account.accountId,
    destinationLatitude: 34.052235, // Latitude de Los Angeles
    destinationLongitude: -118.243683, // Longitude de Los Angeles
    userLatitude: 40.712776, // Latitude de Nova York (origem)
    userLongitude: -74.005974, // Longitude de Nova York (origem)
  });
  const rideInfo = await getRide(rideId);
  expect(rideInfo).toBeDefined();
  expect(rideInfo.ride_id).toBe(rideId);
});
