// Generated by Xata Codegen 0.30.0. Please do not edit.
import { buildClient } from "@xata.io/client";
import type {
  BaseClientOptions,
  SchemaInference,
  XataRecord,
} from "@xata.io/client";

const tables = [
  {
    name: "WalletSubscriptions",
    checkConstraints: {
      WalletSubscriptions_xata_id_length_xata_id: {
        name: "WalletSubscriptions_xata_id_length_xata_id",
        columns: ["xata_id"],
        definition: "CHECK ((length(xata_id) < 256))",
      },
    },
    foreignKeys: {},
    primaryKey: [],
    uniqueConstraints: {
      _pgroll_new_WalletSubscriptions_xata_id_key: {
        name: "_pgroll_new_WalletSubscriptions_xata_id_key",
        columns: ["xata_id"],
      },
    },
    columns: [
      {
        name: "subscriberPhoneNumber",
        type: "text",
        notNull: true,
        unique: false,
        defaultValue: "''::text",
        comment: "",
      },
      {
        name: "walletAddress",
        type: "text",
        notNull: true,
        unique: false,
        defaultValue: "''::text",
        comment: "",
      },
      {
        name: "xata_createdat",
        type: "datetime",
        notNull: true,
        unique: false,
        defaultValue: "now()",
        comment: "",
      },
      {
        name: "xata_id",
        type: "text",
        notNull: true,
        unique: true,
        defaultValue: "('rec_'::text || (xata_private.xid())::text)",
        comment: "",
      },
      {
        name: "xata_updatedat",
        type: "datetime",
        notNull: true,
        unique: false,
        defaultValue: "now()",
        comment: "",
      },
      {
        name: "xata_version",
        type: "int",
        notNull: true,
        unique: false,
        defaultValue: "0",
        comment: "",
      },
    ],
  },
] as const;

export type SchemaTables = typeof tables;
export type InferredTypes = SchemaInference<SchemaTables>;

export type WalletSubscriptions = InferredTypes["WalletSubscriptions"];
export type WalletSubscriptionsRecord = WalletSubscriptions & XataRecord;

export type DatabaseSchema = {
  WalletSubscriptions: WalletSubscriptionsRecord;
};

const DatabaseClient = buildClient();

const defaultOptions = {
  databaseURL:
    "https://Blocverse-Development-es1pni.us-east-1.xata.sh/db/onchain-buddy",
};

export class XataClient extends DatabaseClient<DatabaseSchema> {
  constructor(options?: BaseClientOptions) {
    super({ ...defaultOptions, ...options }, tables);
  }
}

let instance: XataClient | undefined = undefined;

export const getXataClient = () => {
  if (instance) return instance;

  instance = new XataClient();
  return instance;
};
