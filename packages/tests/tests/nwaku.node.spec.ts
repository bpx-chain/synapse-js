import { expect } from "chai";

import { argsToArray, defaultArgs } from "../src";

describe("nwaku", () => {
  it("Correctly serialized arguments", function () {
    const args = defaultArgs();
    Object.assign(args, { portsShift: 42 });

    const actual = argsToArray(args);

    const expected = [
      "--listen-address=127.0.0.1",
      "--nat=none",
      "--relay=true",
      "--rpc=true",
      "--rpc-admin=true",
      "--websocket-support=true",
      "--store-message-db-url=sqlite://:memory:",
      "--log-level=DEBUG",
      "--ports-shift=42",
    ];

    expect(actual).to.deep.equal(expected);
  });
});
