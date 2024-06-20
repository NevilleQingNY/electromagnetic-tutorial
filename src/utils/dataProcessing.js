export const parseReflectionAnswer = (reflectionAnswer) => {
    const plot = reflectionAnswer[0].trim().split(" ").map(Number);

    for (let i = 0; i < plot.length; i++) {
        plot[i] = parseFloat(plot[i]).toFixed(5);
    }
    const min_value = plot[0];
    const max_value = plot[1];
    const no_of_samples = plot[2];
    const no_of_time_steps = plot[3];
    const alpha = plot[4];
    const beta = plot[5];
    const wavelength = plot[6];
    const skin_depth = plot[7];
    const real_impedance = plot[8];
    const imag_impedance = plot[9];

    return {
        alpha, beta, wavelength, skin_depth, real_impedance, imag_impedance,
        min_value, max_value, no_of_time_steps, no_of_samples, plot
    };
};
