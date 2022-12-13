import { Program, web3 } from "@project-serum/anchor";
import { Plege } from "../../../shared/idl/plege";
export declare function setup(connection: web3.Connection, programId?: web3.PublicKey | null): void;
export declare function getProgram(): Program<Plege>;
