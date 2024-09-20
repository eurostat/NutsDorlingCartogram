module.exports = (infoText) => `
<div id="infoModalHeader" style="">
    <div class="row modal-icons" style="background-color: #ffffff;">
    <div class="col-7 header-social">
        <!-- share-->
        <div class="share-block ecl-social-media-share ecl-social-media-share--vertical menu-button-actions">
            <button id='share-menu-button' class="share-block-btn" aria-label="Share" type="button" aria-controls="socialsShareMenu" title="Share this tool">
                <svg width="40px" height="40px" class="ecl-icon ecl-icon--m ecl-icon--primary ecl-u-type-color-white ecl-link__icon ecl-social-media-share__icon" focusable="false" aria-hidden="true">
                    <use xlink:href="../../assets/img/ecl-icons/social-media-icons.svg#share"></use>
                </svg>
            </button>
            <ul class="ecl-social-media-share__list" role="menu" tabindex="-1" id="socialsShareMenu" aria-activedescendant="" style="display: none;">
                <p class="ecl-social-media-share__description title">Share</p>
                <li data-href="" data-layout="" data-size="" class="ecl-social-media-share__item" role="menuitem" id="facebookMenuItem" tabindex="-1">
                    <a id="facebook-a" target="_blank" class="ecl-link ecl-link--standalone ecl-link--icon ecl-link--icon-before ecl-social-media-share__link social-btn">
                        <svg class="ecl-icon ecl-icon--m ecl-link__icon ecl-social-media-share__icon" focusable="false" aria-hidden="true">
                            <use xlink:href="../../assets/img/ecl-icons/social-media-icons.svg#facebook-color"></use>
                        </svg>
                        <span class="ecl-link__label">Facebook</span>
                    </a>
                </li>                       
                    <li class="ecl-social-media-share__item" role="menuitem" id="twitterMenuItem" tabindex="-1">
                    <a id="twitter-a" target="_blank" class="ecl-link ecl-link--standalone ecl-link--icon ecl-link--icon-before ecl-social-media-share__link social-btn" data-show-count="false">
                        <svg class="ecl-icon ecl-icon--m ecl-link__icon ecl-social-media-share__icon" focusable="false" aria-hidden="true">
                            <use xlink:href="../../assets/img/ecl-icons/icons-social-media.svg#twitter-color"></use>
                        </svg>
                        <span class="ecl-link__label">X</span>
                    </a>
                </li>
                <li class="ecl-social-media-share__item" role="menuitem" id="linkedinMenuItem" tabindex="-1">
                    <a id="linkedin-a" class="ecl-link ecl-link--standalone ecl-link--icon ecl-link--icon-before ecl-social-media-share__link social-btn">
                        <svg class="ecl-icon ecl-icon--m ecl-link__icon ecl-social-media-share__icon" focusable="false" aria-hidden="true">
                            <use xlink:href="../../assets/img/ecl-icons/social-media-icons.svg#linkedin-color"></use>
                        </svg>
                        <span class="ecl-link__label">LinkedIn</span>
                    </a>
                </li>
                <li class="ecl-social-media-share__item" role="menuitem" id="emailMenuItem" tabindex="-1">
                    <a class="ecl-link ecl-link--standalone ecl-link--icon ecl-link--icon-before ecl-social-media-share__link" aria-controls="social-media-share-popover" aria-label="Email">
                        <svg focusable="false" aria-hidden="true" class="ecl-icon ecl-icon--m ecl-link__icon ecl-social-media-share__icon" width="26px" height="26px">
                            <use xlink:href="../../assets/img/ecl-icons/social-media-icons.svg#email-color"></use>
                        </svg>
                        <span class="ecl-link__label">Email</span>
                    </a>
                </li>
                <li class="ecl-social-media-share__item" role="menuitem" id="embedMenuItem" tabindex="-1">
                    <a class="ecl-link ecl-link--standalone ecl-link--icon ecl-link--icon-before ecl-social-media-share__link" data-bs-toggle="modal" data-bs-target="#embed-modal" aria-controls="social-media-share-popover" aria-label="Embed">
                        <img focusable="false" aria-hidden="true" alt="Embed" src="../../assets/img/code-solid.svg" style="width: 26px; ">									
                        <span class="ecl-link__label">Embed</span>
                    </a> 
                </li>
            </ul>
        </div>
        <!-- end share-->
        
    </div>
    <div class="col-5 estat-logo">
        <a id="logo-desktop" href="https://ec.europa.eu/eurostat"><img src="../../assets/img/logoestat.png" id="logo"></a>
    </div>
    </div>
</div>




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
                    <button type="button" class="close" data-bs-dismiss="modal">
                        &times;
                    </button>
                </div>
                <div class="modal-body" id="embed-content">
                    <pre class="pre-scrollable"><code></code></pre>
                </div>
                <div class="modal-footer">
                    <!-- <button type="button" class="btn btn-warning" data-bs-dismiss="modal">Close</button> -->
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
                    <button type="button" class="close" data-bs-dismiss="modal">
                        &times;
                    </button>
                </div>
                <div class="modal-body" id="source-content">
                </div>
                <div class="modal-footer">
                    <!-- <button type="button" class="btn btn-warning" data-bs-dismiss="modal">Close</button> -->
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
                    <button type="button" class="close" data-bs-dismiss="modal">
                        <span>&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <p class="dorling-standalone-instructions-text" translate="instructions.text">${infoText}</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-warning" data-bs-dismiss="modal"
                        translate="instructions.closebutton">Close</button>
                </div>
            </div>
        </div>
    </div>

</div>
`

// module.exports = (infoText) => `

// `
