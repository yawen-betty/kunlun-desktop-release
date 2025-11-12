<template>

    <svg class="circular" viewBox="25 25 50 50">
        <circle class="path" cx="50" cy="50" fill="none" r="20" stroke-miterlimit="10"
                stroke-width="5"></circle>
    </svg>

</template>

<script lang="ts" setup>

</script>

<style lang="scss" scoped>
@use "@/assets/styles/variable.scss" as *;
@use "@/assets/styles/compute.scss" as *;

.circular {
    -webkit-animation: rotate 2s linear infinite;
    animation: rotate 2s linear infinite;
    -webkit-transform-origin: center center;
    transform-origin: center center;
    width: vw(16);
    height: vw(16);
}

.path {
    width: 100%;
    height: 100%;
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
    -webkit-animation: dash 1.5s ease-in-out infinite, color 6s ease-in-out infinite;
    animation: dash 1.5s ease-in-out infinite, color 6s ease-in-out infinite;
    stroke-linecap: round
}

@-webkit-keyframes rotate {
    to {
        -webkit-transform: rotate(1turn);
        transform: rotate(1turn)
    }
}

@keyframes rotate {
    to {
        -webkit-transform: rotate(1turn);
        transform: rotate(1turn)
    }
}

@-webkit-keyframes dash {
    0% {
        stroke-dasharray: 1, 200;
        stroke-dashoffset: 0
    }

    50% {
        stroke-dasharray: 89, 200;
        stroke-dashoffset: -35
    }

    to {
        stroke-dasharray: 89, 200;
        stroke-dashoffset: -124
    }
}

@keyframes dash {
    0% {
        stroke-dasharray: 1, 200;
        stroke-dashoffset: 0
    }

    50% {
        stroke-dasharray: 89, 200;
        stroke-dashoffset: -35
    }

    to {
        stroke-dasharray: 89, 200;
        stroke-dashoffset: -124
    }
}

@-webkit-keyframes color {
    0%, to {
        stroke: #d62d20
    }

    40% {
        stroke: #0057e7
    }

    66% {
        stroke: #008744
    }

    80%, 90% {
        stroke: #ffa700
    }
}

@keyframes color {
    0%, to {
        stroke: #d62d20
    }

    40% {
        stroke: #0057e7
    }

    66% {
        stroke: #008744
    }

    80%, 90% {
        stroke: #ffa700
    }
}

</style>
