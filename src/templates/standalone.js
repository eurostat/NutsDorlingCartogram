module.exports = (infoText) => `

<div id="landscape_overlay"></div>

<div id="global" class="container-fluid">
    <div id="embed-modal" data-role="dialog" class="modal fade">
        <div class="modal-dialog">
            <!-- Modal content-->
            <div class="modal-content">
                <div class="modal-header">
                    <h4 class="modal-title" translate="embed.title">
                        Copy this code and paste it in your Website:
                    </h4>
                    <button type="button" class="close" data-dismiss="modal">
                        &times;
                    </button>
                </div>
                <div class="modal-body" id="embed-content">
                    <pre class="pre-scrollable"><code></code></pre>
                </div>
                <div class="modal-footer">
                    <!-- <button type="button" class="btn btn-warning" data-dismiss="modal">Close</button> -->
                </div>
            </div>
        </div>
    </div>

    <div id="source-modal" data-role="dialog" class="modal fade">
        <div class="modal-dialog">
            <!-- Modal content-->
            <div class="modal-content">
                <div class="modal-header">
                    <h4 class="modal-title" translate="source.title">
                        Source datasets:
                    </h4>
                    <button type="button" class="close" data-dismiss="modal">
                        &times;
                    </button>
                </div>
                <div class="modal-body" id="source-content">
                </div>
                <div class="modal-footer">
                    <!-- <button type="button" class="btn btn-warning" data-dismiss="modal">Close</button> -->
                </div>
            </div>
        </div>
    </div>

    <!-- Modal -->
    <div id="instructions_overlay" class="modal fade" role="dialog">
        <div class="modal-dialog">
            <!-- Modal content-->
            <div class="modal-content">
                <div class="modal-header">
                    <h4 class="modal-title" translate="instructions.title">Instructions</h4>
                    <button type="button" class="close" data-dismiss="modal">
                        <span>&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <p class="dorling-standalone-instructions-text" translate="instructions.text">${infoText}</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-warning" data-dismiss="modal"
                        translate="instructions.closebutton">Close</button>
                </div>
            </div>
        </div>
    </div>

    <div id="top-bar">

        <nav id="navbar-desktop" class="navbar navbar-expand-sm navbar-light">
            <button title="Toggle Navigation" class="navbar-toggler collapsed" type="button" data-toggle="collapse"
                data-target="#navItems" aria-controls="navItems" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navItems">
                <ul class="navbar-nav mr-auto">
                    <li class="nav-item">
                        <a class="social-button pointer nav-link d-flex justify-content-start align-items-center"
                            id="info-button" title="More information" data-toggle="modal"
                            data-target="#instructions_overlay">
                            <span class="fa-layers fa-2x" data-tooltip="tooltip" data-placement="bottom"
                                title="Information">
                                <i class="fas fa-circle"></i>
                                <i class="fas fa-info fa-inverse" data-fa-transform="shrink-7"></i>
                            </span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="social-button pointer nav-link d-flex justify-content-start align-items-center"
                            id="embed-button" title="Embed this chart" data-toggle="modal" data-target="#embed-modal">
                            <span class="fa-layers fa-2x" data-tooltip="tooltip" data-placement="bottom" title="Embed">
                                <i class="fas fa-circle"></i>
                                <i class="fas fa-code fa-inverse" data-fa-transform="shrink-7 left-2"></i>
                            </span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a id="tweet"
                            class="nav-link d-flex justify-content-start align-items-center social-button pointer"
                            onclick="javascript:window.open(this.href,'', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600');return false;"
                            href="">
                            <span class="fa-layers fa-2x" data-tooltip="tooltip" data-placement="bottom" title="Tweet">
                                <i class="fas fa-circle"></i>
                                <i class="fab fa-twitter fa-inverse" data-fa-transform="shrink-7"></i>
                            </span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link d-flex justify-content-start align-items-center social-button pointer"
                            id="facebook-button" title="Share on Facebook">
                            <span class="fa-layers fa-2x" data-tooltip="tooltip" data-placement="bottom"
                                title="Facebook">
                                <i class="fas fa-circle"></i>
                                <i class="fab fa-facebook-f fa-inverse" data-fa-transform="shrink-7"></i>
                            </span>
                        </a>
                    </li>
                </ul>
            </div>
        </nav>

        <div class="logo" id="estat-logo">
            <a class="float-right order-2 logo">
                <img id="logo" src="../../assets/images/logoEstat.png" class="img-fluid" alt="Logo Eurostat" />
            </a>
        </div>
    </div>
</div>
`