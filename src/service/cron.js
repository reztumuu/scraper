let task

function schedule(callback, interval) {
  if ( task ) {
    clearTimeout(task)
  }

  task = setTimeout(callback, interval)
}

module.exports = schedule
