<script>
import {mapGetters, mapMutations} from "vuex";
import dayjs from "dayjs";
import dayOfYear from "dayjs/plugin/dayOfYear";
import DatePicker from "vue-datepicker-next";
import "vue-datepicker-next/index.css";

import ShadowToolSliderInput from "./ShadowToolSliderInput.vue";
import {updateShadow, updateCesiumTime} from "../js/utilsShadowTool.js";
import SwitchInput from "../../../shared/modules/checkboxes/components/SwitchInput.vue";

dayjs.extend(dayOfYear);

/**
 * Shadow Tool
 * @module modules/ShadowTool
 * @vue-data {Number} currentDay - The current day.
 * @vue-data {Number} currentHour - The current hpur.
 * @vue-data {Number} currentMinute - The current minute.
 * @vue-data {Number} currentMonth - The current month.
 * @vue-data {Number} currentYear - The current year.
 * @vue-data {Number} date - The current date.
 * @vue-data {Number} dateSliderValue - The current date slider value.
 * @vue-data {Date} displayedShadowTime - The current date slider value.
 * @vue-data {String} pickDateFormat - The date format.
 * @vue-data {Date} pickDates - The picked date.
 * @vue-data {Boolean} shadowActivated - Shows if the shadow is activated.
 * @vue-data {Date} showDate - The date.
 * @vue-data {Time} showTime - The time.
 * @vue-data {Number} timeSliderValue - The curent time slider value.
 */
export default {
    name: "ShadowTool",
    components: {
        DatePicker,
        ShadowToolSliderInput,
        SwitchInput
    },
    data () {
        return {
            currentDay: dayjs().format("DD"),
            currentHour: dayjs().hour(),
            currentMinute: dayjs().minute(),
            currentMonth: dayjs().format("MM"),
            currentYear: dayjs().format("YYYY"),
            date: dayjs().format("YYYY-MM-DD"),
            dateSliderValue: 0,
            displayedShadowTime: null,
            pickDateFormat: "DD.MM.YYYY",
            pickDates: null,
            shadowActivated: this.isShadowEnabled,
            showDate: dayjs().format("YYYY-MM-DD"),
            showTime: dayjs().format("HH:mm"),
            timeSliderValue: 0
        };
    },
    computed: {
        ...mapGetters("Modules/Shadow", [
            "isShadowEnabled",
            "shadowTime"
        ]),
        ...mapGetters("Modules/Language", [
            "currentLocale"
        ]),
        ...mapGetters("Maps", {
            mapMode: "mode"
        })
    },
    watch: {
        /**
         * Watch current locale.
         * Check date format, if current locale is changed.
         * @param {String} mapMode The map mode.
         * @returns {void}
         */
        currentLocale () {
            this.checkDateFormat();
        },

        /**
         * Watch the map mode.
         * Initialize shadows, if map mode is 3D.
         * @param {String} mapMode The map mode.
         * @returns {void}
         */
        mapMode (mapMode) {
            if (mapMode === "3D") {
                this.initializeShadow();
            }
        }
    },
    mounted () {
        this.initializeShadow();
    },
    unmounted () {
        this.toggleShadow(false);
        this.setShadowTime({});
    },
    methods: {
        ...mapMutations("Modules/Shadow", [
            "setShadowTime"
        ]),
        updateShadow,
        updateCesiumTime,

        /**
         * Initialize the shadow module.
         * @returns {void}
         */
        initializeShadow () {
            if (Cesium) {
                if (this.isShadowEnabled) {
                    this.toggleShadow(true);
                }

                this.createDate();
            }
        },

        /**
         * Prepares the dates for picker, slider and display
         * @returns {void}
         */
        createDate () {
            const year = this.shadowTime.year ? this.shadowTime.year : this.currentYear,
                checkedMonth = this.shadowTime?.month?.length === 1 ? "0" + this.shadowTime.month : this.shadowTime.month,
                checkedDay = this.shadowTime?.day?.length === 1 ? "0" + this.shadowTime.day : this.shadowTime.day,
                checkedHour = this.shadowTime?.hour?.length === 1 ? "0" + this.shadowTime.hour : this.shadowTime.hour,
                checkedMinute = this.shadowTime?.minute?.length === 1 ? "0" + this.shadowTime.minute : this.shadowTime.minute,
                month = this.shadowTime.month ? checkedMonth : this.currentMonth,
                day = this.shadowTime.day ? checkedDay : this.currentDay,
                hour = this.shadowTime.hour ? checkedHour : this.currentHour,
                minute = this.shadowTime.minute ? checkedMinute : this.currentMinute,
                showDate = [year, month, day].join("-"),
                showTime = [hour, minute].join(":");

            this.showTime = showTime;
            this.pickDates = new Date(showDate);
            this.date = showDate;
            this.checkDateFormat();

            this.dateSliderValue = dayjs(this.date).dayOfYear();
            this.initTimeSlider(hour, minute);
            this.updateShadowTime();
        },

        /**
         * Sync function for the date slider.
         * @param {Object} pickDate Date from the date picker.
         * @returns {void}
         */
        syncDateSlider (pickDate) {
            const date = dayjs(pickDate).format("YYYY-MM-DD");

            if (this.$refs.datePicker) {
                this.date = date;
                this.checkDateFormat();
                this.updateShadowTime();
                this.dateSliderValue = dayjs(date).dayOfYear();
            }
        },

        /**
         * Inition of the time slider.
         * @param {String} hour Current hour.
         * @param {String} minute Current minute.
         * @returns {void}
         */
        initTimeSlider (hour, minute) {
            let initMinuteValue;

            this.shadowTime.minute = this.shadowTime.minute ? this.shadowTime.minute : "0";
            this.shadowTime.hour = this.shadowTime.hour ? this.shadowTime.hour : "0";
            if (this.shadowTime.hour !== "0" || this.shadowTime.minute !== "0") {
                initMinuteValue = Number(this.shadowTime.hour) * 60 + Number(this.shadowTime.minute);
            }
            else {
                initMinuteValue = Number(hour) * 60 + Number(minute);
            }
            this.syncTimeSlider(initMinuteValue);
        },

        /**
         * Sync function for the time slider.
         * @param {Number} minuteValue Date from the date picker.
         * @returns {void}
         */
        syncTimeSlider (minuteValue) {
            const timeSliderValue = minuteValue,
                hours = Math.floor(timeSliderValue / 60),
                minutes = (timeSliderValue % 60).toString(),
                minutesDisplay = minutes?.length === 1 ? "0" + minutes : minutes;

            this.timeSliderValue = minuteValue;
            this.showTime = hours + ":" + minutesDisplay;
            this.updateShadowTime();
        },

        /**
         * Sync function for the date picker.
         * @param {Number} totalDaysInYear Day number of the year.
         * @returns {void}
         */
        syncDatePicker (totalDaysInYear) {
            const startDate = new Date(Number(this.currentYear), 0),
                calculateDate = new Date(startDate.setDate(Number(totalDaysInYear))), // initialize a date in `year-01-01`
                formatCalculateDate = dayjs(calculateDate).format("YYYY-MM-DD");

            if (this.$refs.datePicker) {
                this.date = formatCalculateDate;
                this.pickDates = new Date(formatCalculateDate);
                this.checkDateFormat();
                this.dateSliderValue = totalDaysInYear;
            }
            this.updateShadowTime();
        },

        /**
         * Adapts date formats to englisch (EN) or german (DE).
         * @returns {void}
         */
        checkDateFormat () {
            if (this.$i18next.language === "de-DE" || this.$i18next.language === "de" || this.$i18next.language === "platt") {
                this.showDate = dayjs(this.date).format("DD-MM-YYYY");
                this.pickDateFormat = "DD.MM.YYYY";

            }
            else {
                this.showDate = dayjs(this.date).format("MM-DD-YYYY");
                this.pickDateFormat = "MM.DD.YYYY";
            }
        },

        /**
         * Toggles the shadow.
         * @param {Boolean} visible Shadow is visible.
         * @returns {void}
         */
        toggleShadow (visible) {
            this.shadowActivated = visible;
            this.updateShadow(visible);

        },

        /**
         * Combines the given timestamps for time and date together and updates the Cesium time.
         * @returns {void}
         */
        updateShadowTime () {
            this.displayedShadowTime = new Date(this.date + " " + this.showTime + ":00");
            this.updateCesiumTime(this.displayedShadowTime.getTime());
        }
    }
};
</script>

<template lang="html">
    <div id="modules-shadow-tool">
        <div class="form-check form-switch mb-3 d-flex align-items-center">
            <SwitchInput
                :id="'module-shadow-checkbox'"
                :aria="$t('common:modules.shadow.withInfoLabel')"
                :interaction="() => toggleShadow(!shadowActivated)"
                :label="$t(shadowActivated ? 'common:modules.shadow.shadowDisplayOff' : 'common:modules.shadow.shadowDisplayOn')"
                :checked="shadowActivated"
            />
        </div>
        <div
            id="control"
            class="d-block"
        >
            <div class="d-flex justify-content-between">
                <span
                    class="d-flex flex-column justify-content-center form-label mb-0"
                    for="datePicker"
                >
                    {{ $t('common:modules.shadow.pickDate') }}
                </span>
                <div
                    id="dateSelector"
                >
                    <DatePicker
                        id="datePicker"
                        ref="datePicker"
                        v-model:value="pickDates"
                        :disabled="!shadowActivated"
                        type="date"
                        :format="pickDateFormat"
                        :clearable="false"
                        :show-week-number="true"
                        title-format="pickDateFormat"
                        :lang="$t('common:libraries.vue-datepicker-next.lang', {returnObjects: true})"
                        @change="syncDateSlider($event)"
                    />
                </div>
            </div>
            <ShadowToolSliderInput
                id="dateSlider"
                class="mb-5"
                :valuelabel="showDate"
                :value="dateSliderValue"
                :min="0"
                :step="1"
                :disabled="!shadowActivated"
                :max="366"
                @input="syncDatePicker($event)"
            />
            <ShadowToolSliderInput
                id="timeSlider"
                :label="$t('common:modules.shadow.slideHour')"
                :value="timeSliderValue"
                :valuelabel="showTime"
                :min="1"
                :disabled="!shadowActivated"
                :step="1"
                :max="1440"
                @input="syncTimeSlider($event)"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @import "~variables";

    #dateSelector {
        .mx-input {
            border-radius: 0px;
        }
    }

    .form-check-input {
        width: 2.5rem;
        height: 1.5rem;
    }
</style>
