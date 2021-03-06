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
import { Indicator, Flex, Box } from 'design';
import * as Alerts from 'design/Alert';
import NodeList from 'teleport/components/NodeList';
import Document from './../Document';
import QuickLaunch from './QuickLaunch';
import ClusterSelector from './ClusterSelector';
import useNodes from './useNodes';

export default function DocumentNodes({ visible, doc }) {
  const {
    nodes,
    attempt,
    createSshSession,
    changeCluster,
    getNodeSshLogins,
  } = useNodes(doc);
  const { isProcessing, isSuccess, isFailed, message } = attempt;

  function onLoginMenuSelect(
    e: React.MouseEvent,
    login: string,
    serverId: string
  ) {
    // allow to open a new browser tab (not the console one) when requested
    const newBrowserTabRequested = e.ctrlKey || e.metaKey;
    if (!newBrowserTabRequested) {
      e.preventDefault();
      createSshSession(login, serverId);
    }
  }

  function onQuickLaunchEnter(login: string, serverId: string) {
    createSshSession(login, serverId);
  }

  function onLoginMenuOpen(serverId: string) {
    return getNodeSshLogins(serverId);
  }

  function onChangeCluster(newClusterId: string) {
    changeCluster(newClusterId);
  }

  return (
    <Document visible={visible}>
      <Flex
        flex="1"
        maxWidth="1024px"
        flexDirection="column"
        mx="auto"
        mt="8"
        px="5"
      >
        <Flex justifyContent="space-between">
          <QuickLaunch mb="5" onPress={onQuickLaunchEnter} mr="3" />
          <ClusterSelector
            value={doc.clusterId}
            width="400px"
            maxMenuHeight={200}
            onChange={onChangeCluster}
          />
        </Flex>
        {isProcessing && (
          <Box textAlign="center" m={10}>
            <Indicator />
          </Box>
        )}
        {isFailed && <Alerts.Danger mt="5">{message}</Alerts.Danger>}
        {isSuccess && (
          <NodeList
            onLoginMenuOpen={onLoginMenuOpen}
            onLoginSelect={onLoginMenuSelect}
            nodes={nodes}
          />
        )}
      </Flex>
    </Document>
  );
}
