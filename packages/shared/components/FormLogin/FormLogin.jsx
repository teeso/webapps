/*
Copyright 2019 Gravitational, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Card, Box, Text, Flex, ButtonLink, ButtonPrimary } from 'design';
import * as Alerts from 'design/Alert';
import { isU2f, isOtp } from './../../services/enums';
import SsoButtonList from './SsoButtons';
import Validation from '../Validation';
import FieldInput from '../FieldInput';
import { requiredToken, requiredField } from '../Validation/rules';


const SSOLogin = ({
  isProcessing, 
  authProviders, 
  onLoginWithSso
}) => (
  <SsoButtonList
    prefixText="Login with"
    isDisabled={isProcessing}
    providers={authProviders}
    onClick={onLoginWithSso}
  />
)

const OTP = ({
  requiredToken, 
  token
}) => (
  <Flex flexDirection="row">
    <FieldInput
      label="Two factor token"
      rule={requiredToken}
      autoComplete="off"
      width="50%"
      mr={3}
      value={token}
      onChange={e => setToken(e.target.value)}
      placeholder="123 456"
    />
    <ButtonLink
      kind="secondary"
      target="_blank"
      size="small"
      href="https://support.google.com/accounts/answer/1066447?co=GENIE.Platform%3DiOS&hl=en&oco=0"
      rel="noreferrer"
    >
      Download Google Authenticator
    </ButtonLink>
  </Flex>
)

const NoLoginEnabled = () => (
  <Box px={5} pb={5}>
    <Alerts.Danger my={5}>Login has not been enabled</Alerts.Danger>
    <Text mb={2} typography="paragraph2" width="100%">
      The ability to login has not been enabled. Please contact your system administrator for more information. 
    </Text>
  </Box>

)


export default function LoginForm(props) {
  const {
    title,
    attempt,
    auth2faType,
    onLoginWithU2f,
    onLogin,
    onLoginWithSso,
    authProviders,
    isLocalAuthEnabled = true,
  } = props;

  const [pass, setPass] = React.useState('');
  const [user, setUser] = React.useState('');
  const [token] = React.useState('');

  const u2fEnabled = isU2f(auth2faType);
  const otpEnabled = isOtp(auth2faType);
  const ssoEnabled = authProviders && authProviders.length > 0;
  const { isFailed, isProcessing, message } = attempt;
  const loginBackground = ssoEnabled ? "primary.main" : "primary.light"; 

  function onLoginClick(e, validator) {
    e.preventDefault();
    if (!validator.validate()) {
      return;
    }

    if (u2fEnabled) {
      onLoginWithU2f(user, pass);
    } else {
      onLogin(user, pass, token);
    }
  }

  return (
    <Validation>
      {({ validator }) => (
        <Card as="form" bg="primary.light" my="5" mx="auto" width="464px">
          <Text typography="h3" pt={5} textAlign="center" color="light">{title}</Text>
          {isFailed && <Alerts.Danger mx={5} mb={0} mt={5}>{message}</Alerts.Danger>}
          {!ssoEnabled && !isLocalAuthEnabled && <NoLoginEnabled/>}
          {ssoEnabled && <SSOLogin isProcessing={isProcessing}  authProviders={authProviders}  onLoginWithSso={onLoginWithSso} />}
          {isLocalAuthEnabled && (
            <Box p="5" style={{position: 'relative'}} bg={loginBackground} borderBottomLeftRadius="3" borderBottomRightRadius="3">
              {ssoEnabled &&  <StyledOr>Or</StyledOr>}
              <FieldInput
                rule={requiredField('Username is required')}
                label="Username"
                autoFocus
                value={user}
                onChange={e => setUser(e.target.value)}
                placeholder="User name"
              />
              <FieldInput
                rule={requiredField('Password is required')}
                label="Password"
                value={pass}
                onChange={e => setPass(e.target.value)}
                type="password"
                placeholder="Password"
              />
              {otpEnabled && <OTP requiredToken={requiredToken} token={token} />}
              <ButtonPrimary
                width="100%"
                mt="3"
                type="submit"
                size="large"
                onClick={e => onLoginClick(e, validator)}
                disabled={isProcessing}
              >
                LOGIN
              </ButtonPrimary>

              {isProcessing && u2fEnabled && (
                <Text mt={2} typography="paragraph2" width="100%" textAlign="center">
                  Insert your U2F key and press the button on the key
                </Text>
              )}
            </Box>
          )}
        </Card>
      )}
    </Validation>
  );
}

const StyledOr = styled.div`
  background: ${props => props.theme.colors.primary.light}; 
  display: flex;
  align-items: center;
  font-size: 10px; 
  height: 32px; 
  width: 32px; 
  margin-left: -16px; 
  left: 50%; 
  top: -16px; 
  justify-content: center;
  border-radius: 50%;
  box-sizing: border-box;
  position: absolute;
  z-index: 1;
`

LoginForm.propTypes = {
  /**
   * authProviders is an array of Single Sign On (SSO) Providers.
   * eg: github, google, bitbucket, microsoft, unknown, etc.
   *
   * enums are defined in shared/ButtonSso/utils.js
   */
  authProviders: PropTypes.array,

  /**
   * auth2faType defines login type.
   * eg: u2f, otp, off (disabled).
   *
   * enums are defined in shared/services/enums.js
   */
  auth2faType: PropTypes.string,

  /**
   * attempt contains props that indicate login processing status.
   *
   * fmt: {isFailed: bool, isProcessing: bool, message: string}
   */
  attempt: PropTypes.object.isRequired,

  onLoginWithU2f: PropTypes.func.isRequired,
  onLogin: PropTypes.func.isRequired,
  onLoginWithSso: PropTypes.func.isRequired,
};
