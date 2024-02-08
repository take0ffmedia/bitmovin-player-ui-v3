import { LabelConfig, Label } from './label';
import { UIInstanceManager } from '../uimanager';
import { PlayerAPI } from 'bitmovin-player';

declare const window: any;

/**
 * Enumerates the types of content that the {@link MetadataLabel} can display.
 */
export enum MetadataLabelContent {
  /**
   * Title of the data source.
   */
  Title,
  /**
   * Description fo the data source.
   */
  Description,
}

/**
 * Configuration interface for {@link MetadataLabel}.
 */
export interface MetadataLabelConfig extends LabelConfig {
  /**
   * The type of content that should be displayed in the label.
   */
  content: MetadataLabelContent;
}

/**
 * A label that can be configured to display certain metadata.
 */
export class MetadataLabel extends Label<MetadataLabelConfig> {
  constructor(config: MetadataLabelConfig) {
    super(config);

    this.config = this.mergeConfig(
      config,
      {
        cssClasses: [
          'label-metadata',
          'label-metadata-' + MetadataLabelContent[config.content].toLowerCase(),
        ],
      } as MetadataLabelConfig,
      this.config,
    );
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let config = this.getConfig();
    let uiconfig = uimanager.getConfig();

    let init = () => {
      let metadata = player.getSource()?.metadata;
      switch (config.content) {
        case MetadataLabelContent.Title:
          this.setText(uiconfig.metadata.title);
          break;
        case MetadataLabelContent.Description:
          if (metadata?.description) {
            this.setText(metadata.description);
          }
          break;
      }
    };

    let unload = () => {
      this.setText(null);
    };

    // Init label
    init();
    // Clear labels when source is unloaded
    player.on(player.exports.PlayerEvent.SourceUnloaded, unload);

    uimanager.getConfig().events.onUpdated.subscribe(init);

    if (window.bitmovin.customMessageHandler) {
      window.bitmovin.customMessageHandler.on('changeMetadata', (data?: string) => {
        init();
      });
    }
  }
}
