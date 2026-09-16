/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IWorkbenchContribution, WorkbenchPhase, registerWorkbenchContribution2 } from '../../common/contributions.js';
import { IInstantiationService } from '../../../platform/instantiation/common/instantiation.js';

// --- other interested parties
import { JSONValidationExtensionPoint } from '../common/jsonValidationExtensionPoint.js';
import { ColorExtensionPoint } from '../../services/themes/common/colorExtensionPoint.js';
import { IconExtensionPoint } from '../../services/themes/common/iconExtensionPoint.js';
import { TokenClassificationExtensionPoints } from '../../services/themes/common/tokenClassificationExtensionPoint.js';
import { LanguageConfigurationFileHandler } from '../../contrib/codeEditor/common/languageConfigurationExtensionPoint.js';
import { StatusBarItemsExtensionPoint } from './statusBarExtensionPoint.js';
import { CSSExtensionPoint } from '../../services/themes/browser/cssExtensionPoint.js';

// --- mainThread participants
import './mainThreadAgentEditorComments.js';
import './mainThreadLocalization.js';
import './mainThreadBulkEdits.js';
// Code Slim: removed './mainThreadChatAgents2.js' (chat contrib removed)
// Code Slim: removed './mainThreadChatCodeMapper.js' (chat contrib removed)
// Code Slim: removed './mainThreadLanguageModelTools.js' (chat tools removed; ILanguageModelToolsService needs IMcpService)
// Code Slim: kept './mainThreadLanguageModels.js' (re-added): the extension host still constructs
// ExtHostLanguageModels eagerly (vscode.lm API) and asserts the main-thread proxy exists; all of its
// service dependencies are still registered.
// Code Slim: removed './mainThreadEmbeddings.js' (AI contrib removed)
import './mainThreadCodeInsets.js';
import './mainThreadCLICommands.js';
import './mainThreadClipboard.js';
import './mainThreadCommands.js';
import './mainThreadConfiguration.js';
import './mainThreadConsole.js';
// Code Slim: re-added './mainThreadEmbeddings.js': it self-contains its IEmbeddingsService (nothing
// to do with the removed aiEmbeddingVectorService) and the extension host eagerly asserts its proxy.
import './mainThreadEmbeddings.js';
import './mainThreadLanguageModels.js';
// Code Slim: removed './mainThreadDebugService.js' (debug contrib removed)
import './mainThreadDecorations.js';
import './mainThreadDiagnostics.js';
import './mainThreadDialogs.js';
import './mainThreadDocumentContentProviders.js';
import './mainThreadDocuments.js';
import './mainThreadDocumentsAndEditors.js';
import './mainThreadEditor.js';
import './mainThreadEditors.js';
import './mainThreadEditorTabs.js';
import './mainThreadErrors.js';
import './mainThreadExtensionService.js';
import './mainThreadFileSystem.js';
import './mainThreadFileSystemEventService.js';
import './mainThreadLanguageFeatures.js';
import './mainThreadLanguages.js';
import './mainThreadLogService.js';
import './mainThreadMessageService.js';
import './mainThreadManagedSockets.js';
import './mainThreadBrowserTunnelProxy.js';
import './mainThreadOutputService.js';
import './mainThreadProgress.js';
import './mainThreadQuickDiff.js';
import './mainThreadDocumentDiff.js';
import './mainThreadQuickOpen.js';
import './mainThreadRemoteConnectionData.js';
import './mainThreadSaveParticipant.js';
// Code Slim: removed './mainThreadSpeech.js' (voice/speech extension API removed)
import './mainThreadEditSessionIdentityParticipant.js';
import './mainThreadSCM.js';
import './mainThreadSearch.js';
import './mainThreadStatusBar.js';
import './mainThreadStorage.js';
import './mainThreadTelemetry.js';
import './mainThreadTerminalService.js';
import './mainThreadTerminalShellIntegration.js';
import './mainThreadTheming.js';
import './mainThreadTreeViews.js';
import './mainThreadDownloadService.js';
import './mainThreadUrls.js';
import './mainThreadUriOpeners.js';
import './mainThreadWindow.js';
import './mainThreadPower.js';
import './mainThreadWebviewManager.js';
import './mainThreadWorkspace.js';
import './mainThreadComments.js';
// Code Slim: removed notebook mainThread participants (notebook contrib removed):
//   './mainThreadNotebook.js'
//   './mainThreadNotebookKernels.js'
//   './mainThreadNotebookDocumentsAndEditors.js'
//   './mainThreadNotebookRenderers.js'
//   './mainThreadNotebookSaveParticipant.js'
// Code Slim: removed './mainThreadInteractive.js' (interactive window removed)
// Code Slim: removed './mainThreadTask.js' (tasks contrib removed)
import './mainThreadLabelService.js';
// Code Slim: removed './mainThreadTunnelService.js' (tunnel/remote contrib removed)
import './mainThreadAuthentication.js';
import './mainThreadTimeline.js';
// Code Slim: removed './mainThreadTesting.js' (testing contrib removed)
import './mainThreadSecretState.js';
import './mainThreadShare.js';
import './mainThreadProfileContentHandlers.js';
import './mainThreadAiRelatedInformation.js';
// Code Slim: removed './mainThreadAiEmbeddingVector.js' (AI contrib removed)
// Code Slim: removed './mainThreadAiSettingsSearch.js' (AI contrib removed)
// Code Slim: removed './mainThreadMcp.js' (MCP contrib removed)
// Code Slim: removed chat mainThread participants (chat UI contrib removed):
//   './mainThreadChatContext.js'
//   './mainThreadChatDebug.js'
//   './mainThreadChatStatus.js'
//   './mainThreadChatQuota.js'
//   './mainThreadChatInputNotification.js'
//   './mainThreadChatOutputRenderer.js'
//   './mainThreadChatSessions.js'
import './mainThreadDataChannels.js';
import './mainThreadMeteredConnection.js';
import './mainThreadGitExtensionService.js';
import './mainThreadBrowsers.js';

export class ExtensionPoints implements IWorkbenchContribution {

	static readonly ID = 'workbench.contrib.extensionPoints';

	constructor(
		@IInstantiationService private readonly instantiationService: IInstantiationService
	) {
		// Classes that handle extension points...
		this.instantiationService.createInstance(JSONValidationExtensionPoint);
		this.instantiationService.createInstance(ColorExtensionPoint);
		this.instantiationService.createInstance(IconExtensionPoint);
		this.instantiationService.createInstance(TokenClassificationExtensionPoints);
		this.instantiationService.createInstance(LanguageConfigurationFileHandler);
		this.instantiationService.createInstance(StatusBarItemsExtensionPoint);
		this.instantiationService.createInstance(CSSExtensionPoint);
	}
}

registerWorkbenchContribution2(ExtensionPoints.ID, ExtensionPoints, WorkbenchPhase.BlockStartup);
