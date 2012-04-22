/**
 * @author 
 */

/**
 * @class Frame rate counter
 */
function FrameRateCounter() {
    this.lastFrameCount = 0;

    var dateTemp = new Date();
    this.frameLast = dateTemp.getTime();
    delete dateTemp;

    this.frameCtr = 0;
}

FrameRateCounter.prototype.countFrames = function() {
    var dateTemp = new Date();
    this.frameCtr++;
    
    if (dateTemp.getTime() >= this.frameLast + 1000) {
        this.lastFrameCount = this.frameCtr;
        this.frameLast = dateTemp.getTime();
        this.frameCtr = 0;
    }

    delete dateTemp;
}
