function dispatchEvent(el: HTMLElement) {
  let evt = document.createEvent('HTMLEvents')
  evt.initEvent('input', true, true)
  el.dispatchEvent(evt)
}

export default {
  mounted(el: any) {
    try {
      const { classList } = el
      let inputNode: any = null

      if (classList.contains('ivu-input-type-text')) {
        inputNode = el.querySelector('input')
      } else if (classList.contains('ivu-input-type-textarea')) {
        inputNode = el.querySelector('textarea')
      } else {
        inputNode = el
      }

      const handler = (e: any) => {
        const newVal = e.target.value.trim()
        e.target.value = newVal
        // 主动执行一次input事件，否则v-model的值没有被trim
        dispatchEvent(inputNode)
      }

      inputNode.addEventListener('keydown', (e:KeyboardEvent)=>{
        if (e.key === 'Enter') {
          handler(e)
        }
      })
      inputNode.addEventListener('blur', handler)

      el._inputNode = inputNode
      el._blurHandler = handler
    } catch (error) {
      console.log(error)
    }
  },
  unmounted(el: any) {
    const { _inputNode, _blurHandler } = el

    _inputNode.removeEventListener('blur', _blurHandler)
  }
}
