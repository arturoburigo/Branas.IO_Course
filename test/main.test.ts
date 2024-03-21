import { getAccount, requestRide, signup } from "../src/main";

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

it("should be able to create a ride request", async () => {
  const rideRequestData = {
    passengerId: crypto.randomUUID(), // ID fictício do passageiro
    userLatitude: 40.73061, // Latitude fictícia para a localização inicial (exemplo: Nova Iorque)
    userLongitude: -73.935242, // Longitude fictícia para a localização inicial
    destinationLatitude: 34.052235, // Latitude fictícia para o destino (exemplo: Los Angeles)
    destinationLongitude: -118.243683, // Longitude fictícia para o destino
  };

  const result = await requestRide(
    rideRequestData.passengerId,
    rideRequestData.userLatitude,
    rideRequestData.userLongitude,
    rideRequestData.destinationLongitude,
    rideRequestData.destinationLatitude,
  );

  console.log(result);

  expect(result).not.toBeNull();
});
