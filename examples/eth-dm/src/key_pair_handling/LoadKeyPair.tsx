import { Button, TextField } from '@material-ui/core';
import React, { ChangeEvent, useState } from 'react';
import { loadKeyPairFromStorage } from './key_pair_storage';
import { KeyPair } from '../crypto';

export interface Props {
  setEthDmKeyPair: (keyPair: KeyPair) => void;
  disabled: boolean;
}

export function LoadKeyPair({ disabled, setEthDmKeyPair }: Props) {
  const [password, setPassword] = useState<string>();

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const loadKeyPair = () => {
    if (disabled) return;
    if (!password) return;
    loadKeyPairFromStorage(password).then((keyPair: KeyPair | undefined) => {
      if (!keyPair) return;
      console.log('EthDm KeyPair loaded from storage');
      setEthDmKeyPair(keyPair);
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <TextField
        id="password-input"
        label="Password"
        variant="filled"
        type="password"
        onChange={handlePasswordChange}
        value={password}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={loadKeyPair}
        disabled={!password || disabled}
      >
        Load Eth-DM Key Pair from storage
      </Button>
    </div>
  );
}
