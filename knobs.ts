class KnobMonitor {
    // You can change this :
    defaultMin: number = 0
    defaultMax: number = 100
    defaultPrec: number = 0
    defaultSpeed: number = 1
    defaultRotRange: number = 300

    // Don't change this :
    knobPressed: HTMLElement|null = null
    mouseStartPos: number = 0
    bufferSpeed: number = 0


    // Declare mouse move and up events then update()
    constructor() {
        document.addEventListener('mouseup', this.mouseUpHandler)
        document.addEventListener('mousemove', this.mouseMoveHandler)
        this.updateKnobs()
    }

    // Calcul next value
    setKnobValue(e: MouseEvent) {
        // Get attributes
        let min = Number(this.knobPressed?.getAttribute('min'))
        let max = Number(this.knobPressed?.getAttribute('max'))
        let prec = Number(this.knobPressed?.getAttribute('prec'))
        let speed = Number(this.knobPressed?.getAttribute('speed'))
        let value = Number(this.knobPressed?.getAttribute('value'))

        // Slow moves with shift key
        if (e.shiftKey) {
            speed = speed/4
        }

        // Adapt speed to value range
        speed = speed * ((max-min) / 200)

        // Calcul next value
        let moveY: number = -e.movementY
        let nextValue = this.round( (( value + (moveY * speed))+this.bufferSpeed)  , prec)

        // Low speed buffer : slow moves increment a buffer
        if (nextValue == value && moveY != 0) {
            this.bufferSpeed += moveY * speed
        }
        else {
            this.bufferSpeed = 0
        }

        // Security
        if (nextValue < min) {
            nextValue = min
        }
        if (nextValue > max) {
            nextValue = max
        }

        // Update value
        this.knobPressed?.setAttribute('value', String(nextValue))
    }
    // Calcul next rotation
    setKnobRotation(knob: HTMLElement|null = this.knobPressed) {
        let min = Number(knob?.getAttribute('min'))
        let max = Number(knob?.getAttribute('max'))
        let value = Number(knob?.getAttribute('value'))

        let rotation = Math.round(((value-min) / (max-min)) * this.defaultRotRange) - this.defaultRotRange/2
        knob!.style.transform = 'rotate('+rotation+'deg)'
    }

    // Update a knob values
    updateKnob(element: HTMLElement) {
        // Set attributes
        element.setAttribute('init', '')
        element.hasAttribute('min') ? null : element.setAttribute('min', String(this.defaultMin))
        element.hasAttribute('max') ? null : element.setAttribute('max', String(this.defaultMax))
        element.hasAttribute('prec') ? null : element.setAttribute('prec', String(this.defaultPrec))
        element.hasAttribute('speed') ? null : element.setAttribute('speed', String(this.defaultSpeed))
        element.hasAttribute('value') ? null : element.setAttribute('value', String(this.defaultMin))

        // Set event listener
        element.addEventListener('mousedown', this.mouseDownHandler)
        
        // Set rotation
        this.setKnobRotation(element as HTMLElement)
    }
    // Update all knobs values in parent childs
    updateKnobs(parent: HTMLElement = document.body) {
        // For each knob
        parent.querySelectorAll('knob:not([init])').forEach((element)=>{
            this.updateKnob(element as HTMLElement)
        })
    }

    // Events handlers
    mouseDownHandler(e: any): void {
        KNOBS.knobPressed = e.currentTarget as HTMLElement
        KNOBS.knobPressed.setAttribute('pressed', '')
    }
    mouseMoveHandler(e: any): void {
        e.stopPropagation()
        if (KNOBS.knobPressed != null) {
            // Update knob values
            KNOBS.setKnobValue(e)
            KNOBS.setKnobRotation()

            // Dispatch change event
            var event = new Event('change');
            KNOBS.knobPressed.dispatchEvent(event);
        }
    }
    mouseUpHandler(e: any): void {
        e.stopPropagation()
        KNOBS.knobPressed?.removeAttribute('pressed')
        KNOBS.knobPressed = null
    }

    // Round function, precision based
    round(value: number, precision: number) {
        var multiplier = Math.pow(10, precision || 0)
        return Math.round(value * multiplier) / multiplier
    }
}
let KNOBS = new KnobMonitor()
