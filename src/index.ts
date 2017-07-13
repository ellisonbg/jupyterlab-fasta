/*-----------------------------------------------------------------------------
| Copyright (c) Jupyter Development Team.
| Distributed under the terms of the Modified BSD License.
|----------------------------------------------------------------------------*/

import {
  IRenderMime
} from '@jupyterlab/rendermime-interfaces';

import {
  Widget
} from '@phosphor/widgets';

import * as msa from "msa";

import "msa/css/msa.css";

import "../style/index.css";

const FASTA_MIMETYPE = 'application/vnd.fasta.fasta';

/**
 * A widget for rendering Fasta data, for usage with rendermime.
 */
export
class RenderedFasta extends Widget implements IRenderMime.IRenderer {
  /**
   * Create a new widget for rendering Vega/Vega-Lite.
   */
  constructor(options: IRenderMime.IRendererOptions) {
    super();
    this._mimeType = options.mimeType;
    this.addClass('jp-msa');
    let msaDiv = document.createElement('div');
    this.msa = new msa.msa({
      el: msaDiv,
      vis: {
        sequences: true,
        markers: true,
        metacell: false,
        conserv: false,
        overviewbox: true,
        seqlogo: false,
        gapHeader: false,
        leftHeader: true,
      }
    });

    // The menu doesn't work correctly in the absolutely positioned panel, so
    // disabling it for now. This appears to be fixed in msa master, but the npm
    // package hasn't been updated in a year. See
    // https://github.com/wilzbach/msa/issues/226.
    /*
    this.menu = new msa.menu.defaultmenu({msa: this.msa});
    this.msa.addView("menu", this.menu);
    this.node.appendChild(this.menu.el);
    */

    this.node.appendChild(msaDiv);
  }

  /**
   * Render Fasta into this widget's node.
   */
  renderModel(model: IRenderMime.IMimeModel): Promise<void> {
    let data = model.data[this._mimeType];
    var seqs =  msa.io.fasta.parse(data);
    this.msa.seqs.reset(seqs);
    this._resetWidth();
    this.msa.render();
    return Promise.resolve();
  }

  /**
   * Resize handler
   *
   * @param msg Resize message
   */
  onResize(msg: Widget.ResizeMessage): void {
    // We're inside of a Panel, so we don't get the real width
    this._resetWidth();
  }

  /**
   * Reset the msa width to the current widget width
   */
  private _resetWidth() {
    let newWidth = this.node.getBoundingClientRect().width - this.msa.g.zoomer.getLeftBlockWidth();
    this.msa.g.zoomer.set("alignmentWidth", newWidth);
  }

  msa: any;
  menu: any;
  private _mimeType: string;
}


/**
 * A mime renderer factory for Fasta data.
 */
export
const rendererFactory: IRenderMime.IRendererFactory = {
  safe: false,
  mimeTypes: [FASTA_MIMETYPE],
  createRenderer: options => new RenderedFasta(options)
};

const extensions: IRenderMime.IExtension | IRenderMime.IExtension[] = [
  {
    mimeType: FASTA_MIMETYPE,
    rendererFactory,
    rank: 0,
    dataType: 'string',
    documentWidgetFactoryOptions: {
      name: 'Fasta',
      fileExtensions: ['.fasta'],
      defaultFor: ['.fasta'],
      readOnly: true
    }
  }
];

export default extensions;
